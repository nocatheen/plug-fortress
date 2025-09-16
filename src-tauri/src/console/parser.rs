use regex::Regex;
use std::fs::File;
use std::io::{BufRead, BufReader, Seek, SeekFrom};
use std::sync::LazyLock;
use std::thread;
use std::time::Duration;

static START_RE: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^\d{2}/\d{2}/\d{4} - \d{2}:\d{2}:\d{2}:").unwrap());

pub struct ConsoleParser {
    pub reader: BufReader<File>,
}

impl ConsoleParser {
    pub fn new(path: &str) -> Self {
        let mut reader = BufReader::new(File::open(path).unwrap());
        reader.seek(SeekFrom::End(0)).unwrap();
        Self { reader }
    }

    pub fn read_block(&mut self) -> Vec<String> {
        let mut block = Vec::new();

        loop {
            let pos = self.reader.stream_position().unwrap();
            let mut line = String::new();
            let bytes = self.reader.read_line(&mut line).unwrap_or(0);

            if bytes > 0 {
                let line = line.trim_end();

                if START_RE.is_match(line) {
                    if !block.is_empty() {
                        self.reader.seek(SeekFrom::Start(pos)).unwrap();
                        return block;
                    }
                }
                block.push(line.to_string());
            } else {
                if !block.is_empty() {
                    return block;
                }

                thread::sleep(Duration::from_millis(200));
            }
        }
    }
}
