import { Facebook, Instagram, Mail, MapPin, Twitter } from "lucide-react";
import Link from "next/link";

const groups = [
  {
    title: "Get to know us",
    links: ["About Amazon", "Careers", "Press releases", "Amazon Science"]
  },
  {
    title: "Connect with us",
    links: ["Facebook", "Twitter", "Instagram", "LinkedIn"]
  },
  {
    title: "Make money with us",
    links: ["Sell on Amazon", "Fulfilment by Amazon", "Advertise products", "Amazon Pay"]
  },
  {
    title: "Let us help you",
    links: ["Your account", "Returns centre", "100% purchase protection", "Help"]
  }
];

export function Footer() {
  return (
    <footer className="mt-12 bg-amazon-blue text-white">
      <Link href="#" className="block bg-[#37475a] py-3 text-center text-sm font-semibold hover:bg-[#46576b]">
        Back to top
      </Link>
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {groups.map((group) => (
          <div key={group.title}>
            <h3 className="mb-3 font-bold">{group.title}</h3>
            <ul className="space-y-2 text-sm text-slate-200">
              {group.links.map((link) => (
                <li key={link}>
                  <Link href="#" className="hover:text-amazon-gold">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 bg-amazon-navy">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="text-2xl font-black">
            amazon<span className="text-amazon-gold">.in</span>
          </Link>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              India
            </span>
            <span className="inline-flex items-center gap-2">
              <Mail className="h-4 w-4" />
              support@example.com
            </span>
            <span className="flex gap-3">
              <Facebook className="h-4 w-4" />
              <Twitter className="h-4 w-4" />
              <Instagram className="h-4 w-4" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
