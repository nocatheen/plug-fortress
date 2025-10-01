import { Center, Stack, Tooltip, UnstyledButton } from "@mantine/core";
import classes from "./Navbar.module.css";
import { type AArrowDown } from "lucide-react";

interface NavbarLinkProps {
  icon: typeof AArrowDown;
  label: string;
  active?: boolean;
  loading: boolean;
  onClick?: () => void;
}

function NavbarLink({ icon: Icon, label, active, loading, onClick }: NavbarLinkProps) {
  return (
    <Tooltip
      label={label}
      position="right"
      transitionProps={{ transition: "fade-right", duration: 500 }}
      color="gray"
    >
      <UnstyledButton onClick={onClick} className={classes.link} data-active={active || undefined}>
        <Icon className={loading ? "animate-bounce mt-[10px] opacity-50" : undefined} size={20} />
      </UnstyledButton>
    </Tooltip>
  );
}

type Link = {
  icon: typeof AArrowDown;
  label: string;
};

export function Navbar({
  data,
  activeTab,
  loadingTab,
  setActiveTab,
}: {
  data: Link[];
  activeTab: number;
  loadingTab: number;
  setActiveTab: (tab: number) => void;
}) {
  const links = data.map((link, i) => (
    <NavbarLink
      {...link}
      loading={i === loadingTab && activeTab !== loadingTab}
      key={link.label}
      active={i === activeTab}
      onClick={() => setActiveTab(i)}
    />
  ));

  return (
    <nav className={classes.navbar}>
      <Center></Center>

      <div className={classes.navbarMain}>
        <Stack justify="center" gap={0}>
          {links}
        </Stack>
      </div>
    </nav>
  );
}
