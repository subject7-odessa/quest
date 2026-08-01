// A Navbar já é injetada no layout raiz (src/app/layout.tsx), então esse
// layout de grupo só existe pra organizar as rotas logadas — não precisa
// renderizar nada a mais.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
