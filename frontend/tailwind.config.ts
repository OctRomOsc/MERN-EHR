/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    mode: "jit",
    theme: {
      extend: {
        colors: {
          "black-100": "#100d25",
          "black-200": "#090325",
          "white-100": "#f3f3f3",
           primary: '#EFD780',//'#202A25',//"#050816",
           secondary: '#232020',//'#5F4BB6',//"blue",
           tertiary: '#BFD1E5',//'#F7FFDD',//'#86A5D9',//"gray",
           accent : '#FCFDAF',//'#DBA159'//"#151030" 
           nav:'#99b3cc'
        },
        boxShadow: {
        //   card: "0px 35px 120px -15px #211e35",
        },
        screens: {
        //   xs: "400px",
        },
        backgroundImage: {
        //   "hero-pattern": "url('/src/assets/pianobg.png')",
        //   "hero-box": "url('/src/assets/.png')"
        },
      },
    },
    plugins: [],
  };