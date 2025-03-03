# Landscape TikTok Clone Project

## Project Overview
This project is a TikTok clone implementation focusing on landscape orientation viewing experience. It aims to provide a similar user experience to TikTok while optimizing for landscape mode, making it more suitable for desktop and tablet users.

## Technical Stack
- Frontend:
  - React.js: Modern UI library for building interactive user interfaces
  - TypeScript: For type-safe JavaScript development
  - CSS Modules/Styled Components: For component styling
- Backend:
  - Firebase: For backend services including:
    - Authentication
    - Real-time Database/Firestore
    - Storage (for video content)
    - Hosting
  - Node.js: For server-side development and API endpoints

## Project Structure
The project follows a modern architecture pattern and is organized as follows:
- `.idea/`: IntelliJ IDEA project configuration files
- `.junie/`: Project documentation and guidelines
- `src/`: Source code directory
  - `components/`: React components
  - `pages/`: Page components and routing
  - `hooks/`: Custom React hooks
  - `services/`: Firebase and API services
  - `types/`: TypeScript type definitions
  - `utils/`: Utility functions and helpers
  - `styles/`: Global styles and themes
- `public/`: Static assets and index.html
- `tests/`: Test files
- `config/`: Configuration files for Firebase and other services

## Development Environment Setup
1. Prerequisites:
   - Node.js (v14 or later)
   - npm or yarn
   - Firebase CLI
   - Git

2. Installation:
   ```bash
   # Clone the repository
   git clone [repository-url]
   cd landscape-tiktok-clone

   # Install dependencies
   npm install

   # Setup Firebase
   npm install -g firebase-tools
   firebase login
   firebase init
   ```

3. Environment Configuration:
   - Create `.env` file based on `.env.example`
   - Configure Firebase credentials
   - Set up development environment variables

4. Running the Project:
   ```bash
   # Start development server
   npm run dev

   # Run tests
   npm test

   # Build for production
   npm run build
   ```

## Development Guidelines
### Code Style
- Follow consistent code formatting
- Write clear, self-documenting code
- Include comments for complex logic
- Write unit tests for new features

### Git Workflow
- Create feature branches from main
- Write meaningful commit messages
- Submit pull requests for review
- Keep commits atomic and focused

### Best Practices
- Follow SOLID principles
- Write testable code
- Document public APIs
- Handle errors appropriately

## Getting Started
(To be added as project develops)

## Contributing
We welcome contributions! Please ensure you:
1. Read through this guidelines document
2. Follow the coding standards
3. Test your changes thoroughly
4. Submit clear, focused pull requests

## License
(To be determined)
