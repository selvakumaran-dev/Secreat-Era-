import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import SendPage from './components/SendPage';
import ReceivePage from './components/ReceivePage';

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-dark-900">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/send" element={<SendPage />} />
                    <Route path="/send/:roomId" element={<SendPage />} />
                    <Route path="/receive/:roomId" element={<ReceivePage />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
