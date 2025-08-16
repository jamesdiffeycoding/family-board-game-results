export default function Card({ children, title }) {
  return (
    <section className="p-4 m-4 rounded-xl border border-gray-300">
      <h1 className="font-bold">{title}</h1>
      {children}
    </section>
  );
}
