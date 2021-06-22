module.exports = {
    mode: "jit",
    purge: {
        content: ["./src/**/*.svelte"],
    },
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {
            colors: {
                purple: {
                    light: "#5E60CE",
                    DEFAULT: "#6930C3",
                    dark: "#7400B8",
                },
                blue: {
                    DEFAULT: "#5390D9",
                    light: "#4EA8DE",
                },
                teal: {
                    DEFAULT: "#56CFE1",
                },
            },
            boxShadow: {
              inner: 'inset 0 1px 4px 0 rgba(0,0,0,0.15)'
            }
        },
    },
    variants: {
        extend: {},
    },
    plugins: [require("@tailwindcss/forms")],
    future: {
        purgeLayersByDefault: true,
        removeDeprecatedGapUtilities: true,
    },
};
