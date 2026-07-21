import Game from "../components/Game"

export default function App() {
  return (
    <div className="app-wrapper">
      <main className="container">
        <Game />
      </main>

      <footer className="app-footer">
        © Desenvolvido por
        <a
          href="https://github.com/brendatrindade"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
        >
          Brenda Trindade
        </a>
      </footer>
    </div>
  )
}
