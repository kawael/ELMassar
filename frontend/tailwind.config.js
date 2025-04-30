/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                "military-green": "#3C4E3F",
                "desert-sand": "#D2B48C",
                "camouflage-brown": "#5A4632",
                "night-black": "#1C1C1C",
                "radar-red": "#D72638",
                "steel-gray": "#6C757D",
                "olive-drab": "#556B2F",
            },
            fontFamily: {
                military: ["Courier New", "Courier", "monospace"],
            },
            backgroundImage: {
                "camouflage-pattern": "url('/path-to-camouflage-pattern.png')",
            },
        },
    },
    plugins: [],
};