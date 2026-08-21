import Link from "next/link";

const links = [
  { href: "/", label: "首页" },
  { href: "/workshop", label: "虚拟试染" },
  { href: "/reverse", label: "AI逆向设计" },
 { href: "/validation", label: "AI纠偏" },
  { href: "/challenge", label: "复刻挑战" },
  { href: "/works", label: "作品" },
  { href: "/about", label: "关于" },
];

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="brand" href="/" aria-label="染见首页">
          <span className="brand-mark">染</span>
          <span>
            <strong>染见</strong>
            <small>RANJIAN · AI DYE LAB</small>
          </span>
        </Link>

        <nav className="main-nav" aria-label="主导航">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
