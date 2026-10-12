import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Navbar from './Components/Navbar';
import ChooseTheme from './Pages/ChooseTheme';
import Introduction from './Pages/Introduction';
import PlayGame from './Pages/PlayGame';
import ChooseSuspect from './Pages/ChooseSuspect';
import Story from './Pages/Story';
import Result from './Pages/Result';

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
        <Route path="/story" element={<Story />} />
        <Route path="/play-game" element={<PlayGame />} />
        <Route path="/choose-suspect" element={<ChooseSuspect />} />
        <Route path="/result" element={<Result />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;