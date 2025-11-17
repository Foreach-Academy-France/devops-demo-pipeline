# 🚀 Démo: Pipeline CI/CD Complet avec GitHub Actions

> **Module 5**: Démonstration live d'un pipeline CI/CD de bout en bout

## 🎯 Objectif de la démo

Montrer en live un pipeline CI/CD réel avec:
- ✅ Build automatique sur chaque commit
- ✅ Tests automatiques (unitaires + intégration)
- ✅ Analyse de code (linting)
- ✅ Build matrix (plusieurs versions Node.js)
- ✅ Caching des dépendances
- ✅ Artifacts (fichiers générés)
- ✅ Déploiement automatique (staging/production)

## 📦 Application de démo

**API REST simple** avec:
- Express.js (serveur HTTP)
- Tests automatisés (Vitest)
- ESLint (analyse de code)
- Build multi-environnements

## 🗂️ Structure du projet

```
demo-pipeline/
├── README.md                    # Ce fichier (documentation)
├── DEMO-SCRIPT.md               # Script de présentation
├── package.json                 # Dépendances et scripts
├── .github/
│   └── workflows/
│       ├── ci.yml               # Pipeline CI (build + test)
│       ├── cd.yml               # Pipeline CD (deploy)
│       └── release.yml          # Release automatique
├── src/
│   ├── server.ts                # Serveur Express
│   ├── routes/
│   │   ├── health.ts
│   │   └── api.ts
│   └── utils/
│       └── logger.ts
├── tests/
│   ├── unit/
│   └── integration/
├── .eslintrc.json               # Config ESLint
└── dist/                        # Build output (généré)
```

## 🎬 Scénario de la démo (15 min)

### Partie 1: Présentation du projet (2 min)

**À montrer:**
```bash
# Structure du projet
tree -L 2

# Scripts package.json
cat package.json | jq '.scripts'
```

**Expliquer:**
- Application = API REST simple
- Scripts: lint, test, build, dev
- Pipeline CI/CD géré par GitHub Actions

---

### Partie 2: Workflow CI - Build & Test (4 min)

**Ouvrir `.github/workflows/ci.yml`**

**Code à montrer:**
```yaml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run lint

  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - name: Cache dependencies
        uses: actions/cache@v3
        with:
          path: ~/.bun/install/cache
          key: ${{ runner.os }}-bun-${{ hashFiles('**/bun.lock') }}
      - run: bun install
      - run: bun test --coverage
      - name: Upload coverage
        uses: actions/upload-artifact@v3
        with:
          name: coverage-${{ matrix.node-version }}
          path: coverage/

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run build
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/
```

**Points clés à expliquer:**

1. **Triggers (`on`):**
   - Push sur `main`/`develop`
   - Pull requests vers `main`

2. **Jobs parallèles:**
   - `lint` → Analyse de code
   - `test` → Tests (matrix 3 versions)
   - `build` → Build final (après lint + test)

3. **Build Matrix:**
   - Teste sur Node 18, 20, 22 en parallèle
   - Détecte les problèmes de compatibilité

4. **Caching:**
   - Cache `~/.bun/install/cache`
   - Accélère les builds (30s → 5s)

5. **Artifacts:**
   - Coverage reports
   - Build dist/
   - Téléchargeables après le run

**Montrer sur GitHub:**
- Onglet "Actions"
- Dernier workflow run
- Jobs qui tournent en parallèle
- Artifacts téléchargeables

---

### Partie 3: Workflow CD - Déploiement (4 min)

**Ouvrir `.github/workflows/cd.yml`**

**Code à montrer:**
```yaml
name: CD Pipeline

on:
  push:
    branches:
      - main
  workflow_dispatch:  # Déclenchement manuel

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run build
      - name: Deploy to staging
        run: |
          echo "Deploying to staging..."
          # Dans la vraie vie: rsync, scp, AWS CLI, etc.
          echo "Deployment URL: https://staging.example.com"

  deploy-production:
    runs-on: ubuntu-latest
    needs: deploy-staging
    environment: production
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run build
      - name: Deploy to production
        run: |
          echo "Deploying to production..."
          echo "Deployment URL: https://example.com"
```

**Points clés:**

1. **Environnements GitHub:**
   - `staging` → Déploiement automatique
   - `production` → Déploiement après validation manuelle

2. **Workflow Dispatch:**
   - Permet de déclencher manuellement
   - Utile pour hotfixes

3. **Déploiement séquentiel:**
   - Staging PUIS production
   - Production ne se lance QUE si staging réussit

**Montrer sur GitHub:**
- Onglet "Settings" → "Environments"
- Protection rules (reviewers, wait timer)
- Deployment history

---

### Partie 4: Release Automatique (3 min)

**Ouvrir `.github/workflows/release.yml`**

**Code à montrer:**
```yaml
name: Release

on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run build

      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            dist/**/*
          generate_release_notes: true
```

**Expliquer:**
- Déclenché sur tag Git (`v1.0.0`, `v2.1.3`, etc.)
- Crée une GitHub Release automatiquement
- Attache les artifacts (dist/)
- Génère les release notes depuis les commits

**Démontrer:**
```bash
# Créer un tag
git tag v1.0.0
git push origin v1.0.0

# Montrer la release créée automatiquement sur GitHub
```

---

### Partie 5: Démo Live - Commit → Déploiement (2 min)

**Scénario:**

1. **Faire un petit changement:**
```typescript
// Dans src/routes/health.ts
export function healthCheck() {
  return {
    status: 'healthy',
    version: '1.0.1',  // ← Changer la version
    timestamp: new Date().toISOString()
  }
}
```

2. **Commit + Push:**
```bash
git add src/routes/health.ts
git commit -m "feat: bump version to 1.0.1"
git push origin main
```

3. **Montrer sur GitHub en temps réel:**
   - Workflow CI qui démarre automatiquement
   - Jobs qui tournent en parallèle (lint, test matrix, build)
   - Artifacts générés
   - Workflow CD qui démarre après CI
   - Déploiement staging
   - (Optionnel) Approbation manuelle pour production

**Points à souligner:**
> "En moins de 2 minutes, mon code est testé, buildé, et déployé en staging. Zéro intervention manuelle !"

---

## 💡 Messages clés à faire passer

### Pipeline CI vs CD

```
CI (Continuous Integration):
├── Lint (analyse de code)
├── Test (unitaires + intégration)
└── Build (compilation)
    ↓
CD (Continuous Deployment):
├── Deploy staging (automatique)
└── Deploy production (avec validation)
```

### Avantages du Pipeline Automatisé

✅ **Feedback rapide** (2-5 min au lieu de 30 min manuel)
✅ **Zéro erreur humaine** (process reproductible)
✅ **Confiance dans le code** (tests obligatoires avant merge)
✅ **Déploiements fréquents** (10x par jour possible)
✅ **Rollback facile** (si problème, revenir au commit précédent)

### Best Practices

✅ **DO:**
- Tester sur plusieurs versions (matrix)
- Cacher les dépendances (gain de temps)
- Fail fast (lint avant tests)
- Environnements séparés (staging/prod)
- Protection des branches (main/master)

❌ **DON'T:**
- Pusher directement sur `main` (utiliser PR)
- Ignorer les tests qui échouent
- Déployer sans tests
- Oublier les secrets (API keys → GitHub Secrets)

---

## 🔐 Secrets & Variables

**Montrer dans GitHub Settings:**

```
Settings → Secrets and variables → Actions

Secrets:
- DEPLOY_TOKEN
- API_KEY
- DATABASE_URL

Variables:
- STAGING_URL
- PRODUCTION_URL
```

**Utilisation dans workflow:**
```yaml
env:
  API_KEY: ${{ secrets.API_KEY }}
  DEPLOY_URL: ${{ vars.STAGING_URL }}
```

---

## 📊 Métriques DORA

**Expliquer les 4 métriques clés:**

1. **Deployment Frequency**: Combien de fois on déploie ?
   - ✅ Elite: Plusieurs fois par jour
   - ❌ Low: Moins d'1 fois par mois

2. **Lead Time for Changes**: Temps entre commit et production ?
   - ✅ Elite: < 1 heure
   - ❌ Low: > 1 mois

3. **Mean Time to Recovery (MTTR)**: Temps pour corriger un incident ?
   - ✅ Elite: < 1 heure
   - ❌ Low: > 1 semaine

4. **Change Failure Rate**: % de déploiements qui échouent ?
   - ✅ Elite: < 15%
   - ❌ Low: > 45%

**Message:**
> "Avec GitHub Actions, vous pouvez atteindre le niveau Elite DORA : déployer 10x par jour avec < 15% d'échecs !"

---

## ❓ Questions Probables

**Q: "GitHub Actions est gratuit ?"**
> R: Oui, 2000 minutes/mois gratuites pour les repos publics. 3000 min/mois pour les repos privés sur le plan gratuit.

**Q: "Peut-on utiliser Jenkins/GitLab CI à la place ?"**
> R: Oui ! Les concepts sont les mêmes. GitHub Actions est juste plus simple à configurer.

**Q: "Comment gérer les secrets (API keys, passwords) ?"**
> R: GitHub Secrets ! Jamais dans le code ou les variables d'environnement en clair.

**Q: "Que faire si un test échoue ?"**
> R: Le pipeline s'arrête automatiquement. Pas de déploiement tant que les tests ne passent pas.

**Q: "Comment rollback si un déploiement casse la prod ?"**
> R: Revert le commit ou re-déployer le tag précédent (`git revert` ou `git push origin v1.0.0`).

---

## 🎓 Pour aller plus loin

### Concepts avancés (à mentionner rapidement)

- **Blue/Green Deployment**: 2 envs identiques, switch instantané
- **Canary Deployment**: Déployer progressivement (10% → 50% → 100% users)
- **Feature Flags**: Activer/désactiver features sans redéployer
- **GitOps**: Flux CD → ArgoCD, FluxCD (pour Kubernetes)

---

## 🔗 Ressources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [DORA Metrics](https://cloud.google.com/blog/products/devops-sre/using-the-four-keys-to-measure-your-devops-performance)
- [GitHub Actions Marketplace](https://github.com/marketplace?type=actions)

---

**Prêt pour la démo ! 🚀**
