import Link from "next/link";

interface SProps {
  children: React.ReactNode;
  title: string;
  link: string;
}

function Session({ children, title, link }: SProps) {
  return (
    <div className="space-y-3">
      <p className="flex justify-between text-[13px] font-medium">
        <span className="text-gray-light">{title}</span>
        <Link href="/marketplace" className="text-primary">
          {link}
        </Link>
      </p>

      <div>{children}</div>
    </div>
  );
}

export default Session;
