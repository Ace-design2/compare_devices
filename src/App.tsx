import { useState } from "react";
import "./App.css";
import LandingPage from "./pages/LandingPage";
import ComparePage from "./pages/ComparePage";
import RecommendPage from "./pages/RecommendPage";

export type PageState = "landing" | "compare" | "recommend";

function App() {
  const [currentPage, setCurrentPage] = useState<PageState>("landing");
  const [compareDeviceIds, setCompareDeviceIds] = useState<number[] | null>(null);

  return (
    <div className="app-container">
      <header>
        <div className="header-content-inner">
          <div
            className="logo"
            onClick={() => setCurrentPage("landing")}
            style={{ cursor: "pointer" }}
          >
            DeviceTech
          </div>
          <a href="mailto:showunmioluwasegun135@gmail.com" className="contact-btn">
            Contact Developer
          </a>
        </div>
      </header>

      <main>
        {currentPage === "landing" && (
          <LandingPage onContinue={(type) => setCurrentPage(type || "compare")} />
        )}
        {currentPage === "compare" && <ComparePage initialDeviceIds={compareDeviceIds} />}
        {currentPage === "recommend" && (
          <RecommendPage 
            onViewDetails={(id: string) => {
              setCompareDeviceIds([Number(id)]);
              setCurrentPage("compare");
            }} 
          />
        )}
      </main>
    </div>
  );
}

export default App;
