**fail-u-forward**

a community driven platform where failure is not something to hide but something to celebrate. It’s designed to share honest stories of setbacks and rejections and lessons learned: all the stuff LinkedIn filters out

**table of contents**

- [Project Insights](#-project-insights)
- [Features](#-features)
- [Technology Stack](#️-technology-stack)
- [Project Structure](#-project-structure)
- [Setup Instructions](#️-setup-instructions)
- [Local Development](#local-development)
- [What's Next](#️-whats-next)

**project insights**

<table align="center">
    <thead align="center">
        <tr>
            <td><b>Stars</b></td>
            <td><b>Forks</b></td>
            <td><b>Issues</b></td>
            <td><b>Open PRs</b></td>
            <td><b>Closed PRs</b></td>
            <td><b>Languages</b></td>
        </tr>
     </thead>
    <tbody>
         <tr>
            <td><img alt="Stars" src="https://img.shields.io/github/stars/mansiruhil/fail-u-forward?style=flat&logo=github"/></td>
            <td><img alt="Forks" src="https://img.shields.io/github/forks/mansiruhil/fail-u-forward?style=flat&logo=github"/></td>
            <td><img alt="Issues" src="https://img.shields.io/github/issues/mansiruhil/fail-u-forward?style=flat&logo=github"/></td>
            <td><img alt="Open PRs" src="https://img.shields.io/github/issues-pr/mansiruhil/fail-u-forward?style=flat&logo=github"/></td>
            <td><img alt="Closed PRs" src="https://img.shields.io/github/issues-pr-closed/mansiruhil/fail-u-forward?style=flat&color=critical&logo=github"/></td>
            <td><img alt="Languages Count" src="https://img.shields.io/github/languages/count/mansiruhil/fail-u-forward?style=flat&color=green&logo=github"></td>
        </tr>
    </tbody>
</table>

**features**

- 📢 Post your rejections, failures and real lessons learned
- 🔍 Browse stories by category:
  - `Startup Crashes`
  - `Interview Wrecks`
  - `Project Chaos`
  - and more coming soon
- 🖥️ Smart AI validation for respectful, safe and constructive content

**technology stack**

<p float="left">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" height="28"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" height="28"/>
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" height="28"/>
  <img src="https://img.shields.io/badge/Gemini_AI-ffffff?style=for-the-badge&logo=google&logoColor=blue" height="28"/>
</p>

- **Frontend:** Next.js + TypeScript  
- **Backend:** Next.js API routes  
- **Database & Auth:** Firebase  
- **AI Validation:** Gemini 

**project structure**

```
fail-u-forward/
├──  app/                          # Next.js App Router directory
│   ├──  api/                      # API routes and endpoints
│   │   ├──  chatbot/              # AI chatbot API endpoints
│   │   ├──  follow/               # User follow/unfollow functionality
│   │   ├── 📁 news/                 # News and updates API
│   │   ├── 📁 post/                 # Post management API
│   │   ├── 📁 upload/               # File upload handling
│   │   ├── 📁 users/                # User management API
│   │   └── 📁 validate/             # Content validation API
│   ├── 📁 about/                    # About page
│   ├── 📁 feed/                     # Main feed page
│   ├── 📁 jobs/                     # Job-related pages
│   ├── 📁 login/                    # Authentication pages
│   ├── 📁 messages/                 # Messaging system
│   ├── 📁 network/                  # Network/social features
│   ├── 📁 networkpost/              # Network post management
│   ├── 📁 notifications/            # Notification system
│   ├──  post/                     # Individual post pages
│   ├── 📁 profile/                  # User profile pages
│   ├──  register/                 # User registration
│   ├── 📁 sad/                      # Failure story pages
│   ├── 📁 technews/                 # Technology news section
│   ├──  topic/                    # Topic-based categorization
│   ├── 📄 globals.css               # Global styles
│   ├──  layout.tsx                # Root layout component
│   ├── 📄 page.tsx                  # Home page
│   └── 📄 storyPage.tsx             # Story display page
├──  components/                   # Reusable UI components
│   ├── 📁 ui/                       # Basic UI components
│   ├── 📁 sidebar/                  # Sidebar components
│   ├──  theme/                    # Theme-related components
│   ├──  feed/                     # Feed-specific components
│   ├── 📁 layout/                   # Layout components
│   ├── 📁 post/                     # Post-related components
│   ├── 📁 profile/                  # Profile components
│   ├── 📄 chatbot.tsx               # AI chatbot component
│   ├── 📄 theme-provider.tsx        # Theme context provider
│   └── 📄 theme-toggle.tsx          # Dark/light mode toggle
├── 📁 contexts/                     # React Context providers
│   ├── 📄 AuthContext.tsx           # Authentication context
│   └── 📄 AuthProvider.tsx          # Auth context provider
├── 📁 hooks/                        # Custom React hooks
│   └── 📄 use-toast.ts              # Toast notification hook
├── 📁 lib/                          # Utility libraries and configurations
│   ├── 📄 firebase.tsx              # Firebase client configuration
│   ├──  firebaseAdmin.tsx         # Firebase admin configuration
│   └──  utils.ts                  # General utility functions
├── 📁 public/                       # Static assets
│   └── 📁 locales/                  # Internationalization files
├── 📁 services/                     # Business logic and API services
│   ├──  ai.ts                     # AI/ML service integrations
│   ├──  firebase.client.ts        # Firebase client services
│   ├── 📄 follow.ts                 # Follow/unfollow functionality
│   ├──  news.ts                   # News service
│   ├──  posts.ts                  # Post management services
│   ├──  users.ts                  # User management services
│   ├── 📄 username.ts               # Username validation
│   └── 📄 validation.ts             # Content validation services
├── 📁 scripts/                      # Build and utility scripts
│   └──  accessibility-test.js     # Accessibility testing script
├── 📁 __tests__/                    # Test files
├── 📁 .github/                      # GitHub workflows and templates
├──  .vscode/                      # VS Code configuration
├──  .util/                        # Utility files
├── 📄 .eslintrc.json                # ESLint configuration
├── 📄 .firebaserc                   # Firebase project configuration
├──  .gitignore                    # Git ignore rules
├── 📄 .npmrc                        # NPM configuration
├──  ACCESSIBILITY.md              # Accessibility guidelines
├── 📄 ACCESSIBILITY_CHECKLIST.md    # Accessibility checklist
├── 📄 CODE_OF_CONDUCT.md            # Code of conduct
├── 📄 Contributing.md               # Contribution guidelines
├──  components.json               # UI components configuration
├── 📄 firebase.json                 # Firebase hosting configuration
├──  i18n.ts                       # Internationalization setup
├──  jest.config.js                # Jest testing configuration
├── 📄 jest.setup.js                 # Jest setup file
├── 📄 LICENSE                       # MIT License
├──  next.config.js                # Next.js configuration
├──  next-i18next.config.js        # Next.js i18n configuration
├── 📄 package.json                  # Project dependencies and scripts
├──  postcss.config.js             # PostCSS configuration
├──  README.md                     # Project documentation
├──  route.ts                      # API route handler
├── 📄 SECURITY.md                   # Security guidelines
├──  tailwind.config.ts            # Tailwind CSS configuration
├──  tsconfig.json                 # TypeScript configuration
└── 📄 vanta.d.ts                    # Vanta.js type definitions
```

**directory descriptions:**

- **`app/`** - Next.js 13+ App Router directory containing all pages and API routes
- **`components/`** - Reusable React components organized by feature
- **`contexts/`** - React Context providers for global state management
- **`hooks/`** - Custom React hooks for shared logic
- **`lib/`** - Utility libraries, configurations, and shared constants
- **`public/`** - Static assets like images, icons, and localization files
- **`services/`** - Business logic layer for API calls and data management
- **`scripts/`** - Build tools, testing scripts, and automation utilities

---

## ⚙️ setup instructions 

**📦 scripts**

| Command         | Description                    |
|-----------------|--------------------------------|
| `npm run dev`   | Run the development server     |
| `npm run build` | Build project for production   |
| `npm start`     | Start production server        |
| `npm run lint`  | Run linter checks              |

**NOTE: *📦 project manager***

previously used **pnpm** but the project now runs entirely on npm !!

---

## Local Development:  

**1. Clone the repository**

```bash
git clone https://github.com/your-username/fail-u-forward.git
```

**2. Move into the project directory**

```bash
cd fail-u-forward
```

**3. Install dependencies**

```bash
npm install
```

**4. Start the dev server**

```bash
npm run dev
```

## 🛣️ What's Next: 

- anonymous posting support
- filters by topic (eg career, academics, personal)  
- voice/video storytelling support 
  follow feature to allow users to follow each other

[🔼 Back to Top](#fail-u-forward)
