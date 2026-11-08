# Contributing to BAGANI (বাগানি)

Thank you for your interest in contributing to **BAGANI**! We welcome bug reports, feature suggestions, localization enhancements, and code contributions that help advance smart urban gardening in South Asia.

---

## Code of Conduct

Please be respectful, collaborative, and considerate of all team members and community contributors.

---

## Development Workflow

1. **Fork the Repository:** Create your own fork on GitHub.
2. **Create a Feature Branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Install Dependencies:**
   ```bash
   npm install
   ```
4. **Run Typecheck & Linting:**
   ```bash
   npm run typecheck
   ```
5. **Commit Your Changes:**
   Follow conventional commits:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation updates
   - `style:` for UI/theme styling
6. **Push and Open a Pull Request:**
   Submit your pull request against the `main` branch with a clear description of the problem solved.

---

## Coding Standards

- **TypeScript Strictness:** Keep strict TypeScript definitions. Do not bypass types with `any` unless strictly unavoidable for dynamic web APIs.
- **Bilingual Consistency:** All newly added UI strings must be provided in both `বাংলা` (Bengali) and `English` inside `lib/core/l10n/translations.ts`.
- **Responsive Layouts:** Test layouts across both mobile screens and responsive web viewports.
- **Agricultural Formulas:** Maintain accuracy with standard agricultural parameters (e.g., container soil 40:30:20:10 ratios, organic neem folia spray recipes, sanitary pruning standards).

---

Developed by **ProFix - Web & Soft**.
