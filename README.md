# 🎬 Moovy – Movie App (Login / Signup with JSON Server)

A simple movie web app built with HTML, CSS, Bootstrap, TypeScript, and JSON Server.  
Supports user authentication and movie browsing with a fake API.

---

## 🚀 Features

- 🔐 Sign up and login functionality using JSON Server
- 🎞️ Movie listing using a static or fake API
- 💾 Store user session in `localStorage`
- ❤️ Add to favorites (optional)
- 🎨 Built with HTML, CSS, Bootstrap 5, and TypeScript

---

## 🧰 Requirements

- Node.js
- TypeScript compiler (`tsc`) installed globally:

```bash
npm install -g typescript
```

---

## 🛠️ Installation

```bash
npm install
```

---

## 🧪 Development Scripts
```bash
npm run server     # Starts json-server on port 3000
npm run build      # Compiles TypeScript to JS
npm run watch      # Watches .ts files and rebuilds on changes
```

---

## 📡 JSON Server Endpoints

| Method | Endpoint                                 | Description                    |
|--------|------------------------------------------|--------------------------------|
| GET    | `/users`                                 | Get all users                  |
| POST   | `/users`                                 | Create a new user              |
| GET    | `/users?username=USERNAME&password=PASS` | Login with username and password |

---

## 📝 Notes

- ⚙️ **JSON Server** is used only during development (`devDependency`)
- 🛠️ **TypeScript output** is located in `public/js`
- 🌐 **Live Server** can be used to serve the `public/` directory
- ⚠️ Make sure you have TypeScript installed globally:  
  `npm install -g typescript`
