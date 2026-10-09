import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Navbar from './Components/Navbar';
import ChooseTheme from './Pages/ChooseTheme';
import Introduction from './Pages/Introduction';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <div>
              <Navbar />
              <Introduction />
            </div>
          }
        />
        <Route path="/choose-theme" element={<ChooseTheme />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;