const menu = document.getElementById("menu");
const nav = document.getElementById("nav");
menu.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menu.textContent = open ? "✕" : "☰";
  menu.setAttribute("aria-expanded", String(open));
});
nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  nav.classList.remove("open");
  menu.textContent = "☰";
  menu.setAttribute("aria-expanded", "false");
}));
const sections = document.querySelectorAll("main section[id]");
const links = document.querySelectorAll("nav a");
const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) links.forEach(link =>
    link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id)
  );
}), { rootMargin: "-35% 0px -55% 0px" });
sections.forEach(section => observer.observe(section));
console.log("SPACE LEGACY homepage ready.");
