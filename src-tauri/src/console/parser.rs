use regex::Regex;
use std::fs::File;
use std::io::{BufRead, BufReader, Seek, SeekFrom};
use std::sync::LazyLock;

static START_RE: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^\d{2}/\d{2}/\d{4} - \d{2}:\d{2}:\d{2}:").unwrap());

pub enum LineType {
    NewBlock,
    Part,
    Empty,
}

pub struct ConsoleParser {
    pub reader: BufReader<File>,
    pub last_line: u64,
}

impl ConsoleParser {
    pub fn new(path: &str) -> Self {
        let mut reader = BufReader::new(File::open(path).unwrap());
        reader.seek(SeekFrom::End(0)).unwrap();
        Self {
            reader,
            last_line: 0,
        }
    }

    pub fn reset_line(&mut self) {
        self.reader.seek(SeekFrom::Start(self.last_line)).unwrap();
    }

    pub fn read_line(&mut self) -> (String, LineType) {
        self.last_line = self.reader.stream_position().unwrap();
        let mut line = String::new();
        let bytes = self.reader.read_line(&mut line).unwrap_or(0);

        if bytes > 0 {
            let line = line.trim_end();
            if START_RE.is_match(line) {
                return (line.to_string(), LineType::NewBlock);
            }
            return (line.to_string(), LineType::Part);
        }
        return (String::new(), LineType::Empty);
    }
}
