import { Center, Stack, Switch, Tooltip, UnstyledButton } from "@mantine/core";
import classes from "./NavbarMinimal.module.css";
import { ChartNoAxesCombined, FileTerminal, House, Settings } from "lucide-react";

interface NavbarLinkProps {
  icon: typeof House;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function NavbarLink({ icon: Icon, label, active, onClick }: NavbarLinkProps) {
  return (
    <Tooltip
      label={label}
      position="right"
      transitionProps={{ transition: "fade-right", duration: 500 }}
      color="gray"
    >
      <UnstyledButton onClick={onClick} className={classes.link} data-active={active || undefined}>
        <Icon size={20} />
      </UnstyledButton>
    </Tooltip>
  );
}

const mockdata = [
  { icon: ChartNoAxesCombined, label: "Match status" },
  { icon: FileTerminal, label: "Console" },
  { icon: Settings, label: "Settings" },
];

export function NavbarMinimal({
  activeTab,
  setActiveTab,
}: {
  activeTab: number;
  setActiveTab: React.Dispatch<React.SetStateAction<number>>;
}) {
  const links = mockdata.map((link, index) => (
    <NavbarLink
      {...link}
      key={link.label}
      active={index === activeTab}
      onClick={() => setActiveTab(index)}
    />
  ));

  return (
    <nav className={classes.navbar}>
      <Tooltip.Group openDelay={500} closeDelay={200}>
        <Center>
          <Tooltip
            label="Start/Stop service"
            position="right"
            transitionProps={{ transition: "fade-right", duration: 500 }}
            refProp="rootRef"
            color="gray"
          >
            <Switch
              size="lg"
              onLabel="ON"
              offLabel="OFF"
              className="mt-5"
              onChange={(event) => alert(event.currentTarget.checked)}
            />
          </Tooltip>
        </Center>

        <div className={classes.navbarMain}>
          <Stack justify="center" gap={0}>
            {links}
          </Stack>
        </div>
      </Tooltip.Group>
    </nav>
  );
}
