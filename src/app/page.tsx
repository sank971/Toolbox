import Link from "next/link";

const tools = [
  {
    href: "/youtube",
    icon: "▶",
    title: "YouTube Converter",
    description:
      "Convertissez n'importe quelle vidéo YouTube en fichier MP3 (audio) ou MP4 (vidéo) en quelques secondes.",
    tags: ["MP3", "MP4", "Audio", "Vidéo"],
    color: "from-red-500 to-orange-500",
  },
  {
    href: "/image",
    icon: "🖼",
    title: "Image Converter",
    description:
      "Convertissez vos images entre PNG, JPEG, WebP, et créez des favicons (.ico) à partir de n'importe quelle image.",
    tags: ["PNG", "JPEG", "WebP", "Favicon"],
    color: "from-blue-500 to-purple-500",
  },
];

const features = [
  {
    icon: "⚡",
    title: "Rapide",
    description: "Conversion instantanée directement dans votre navigateur.",
  },
  {
    icon: "🔒",
    title: "Sécurisé",
    description: "Aucun fichier stocké. Tout est traité côté serveur puis supprimé.",
  },
  {
    icon: "💰",
    title: "Gratuit",
    description: "Tous les outils sont 100% gratuits, sans inscription.",
  },
  {
    icon: "📱",
    title: "Responsive",
    description: "Fonctionne parfaitement sur mobile, tablette et desktop.",
  },
];

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Hero */}
      <section className="py-24 text-center">
        <div className="animate-float inline-block text-6xl mb-6">🧰</div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Votre <span className="gradient-text">Toolbox</span> en ligne
        </h1>
        <p className="text-xl text-neutral-400 max-w-2xl mx-auto mb-10">
          Des outils de conversion puissants, gratuits et respectueux de votre
          vie privée. Aucune inscription requise.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/youtube"
            className="px-6 py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium transition-colors"
          >
            YouTube Converter
          </Link>
          <Link
            href="/image"
            className="px-6 py-3 rounded-xl border border-[var(--border)] hover:bg-[var(--card)] text-white font-medium transition-colors"
          >
            Image Converter
          </Link>
        </div>
      </section>

      {/* Tools */}
      <section className="py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Nos outils</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group block p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-hover)] card-glow transition-all duration-300"
            >
              <div
                className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${tool.color} text-2xl mb-4`}
              >
                {tool.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-[var(--accent-hover)] transition-colors">
                {tool.title}
              </h3>
              <p className="text-neutral-400 mb-4">{tool.description}</p>
              <div className="flex flex-wrap gap-2">
                {tool.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs rounded-full bg-[var(--background)] border border-[var(--border)] text-neutral-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Pourquoi <span className="gradient-text">Toolbox</span> ?
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] text-center"
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-neutral-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center">
        <div className="p-12 rounded-3xl border border-[var(--border)] bg-gradient-to-br from-[var(--card)] to-[var(--background)]">
          <h2 className="text-3xl font-bold mb-4">Prêt à convertir ?</h2>
          <p className="text-neutral-400 mb-8 max-w-lg mx-auto">
            Choisissez un outil et commencez à convertir vos fichiers
            gratuitement en quelques clics.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/youtube"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium hover:opacity-90 transition-opacity"
            >
              Convertir une vidéo
            </Link>
            <Link
              href="/image"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity"
            >
              Convertir une image
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
