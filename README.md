# Portfolio — Arthur Azoula

Portfolio professionnel construit avec Astro, React et Tailwind CSS.

## Stack

- **Astro** + **React** — Framework statique avec hydratation partielle
- **Tailwind CSS v4** — Styling utilitaire
- **TypeScript** — Typage strict
- **i18n** — Bilingue FR/EN

## Commandes

```bash
npm install        # Installer les dépendances
npm run dev        # Serveur de développement (localhost:4321)
npm run build      # Build de production (./dist/)
npm run preview    # Prévisualiser le build
```

## Déploiement

```bash
docker build -t azoulux-portfolio .
docker run -p 80:80 azoulux-portfolio
```

Fichiers K8s dans `k8s/` — Deployment, Service, Ingress.
CI/CD via GitHub Actions dans `.github/workflows/ci-cd.yaml`.

