export function LoadingScreen({
  children,
  visible,
}: {
  children: React.ReactNode;
  visible: boolean;
}) {
  return <>{visible || <div className="absolute inset-0">{children}</div>}</>;
}
