
import React,{BrowserRouter as Router,Routes,Route} from "react-router-dom";
import Footer from "./components/footer";
import Home from "./components/Home";
import RecordingPage from "./components/RecordingPage";
import TranscriptionDisplay from "./components/TranscriptionDisplay";
import Navbar from "./components/navbar";
import ContactPage from "./components/contact";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <>
    {/* <Home/> */}
    {/* <RecordingPage/>
    <TranscriptionDisplay/> */}
    {/* <Footer/> */}

    <Router>
      <Navbar/>
      <Routes>
        <Route path="/" element={<ProtectedRoute><Home/></ProtectedRoute>}/>
        <Route path="/recording" element={<ProtectedRoute><RecordingPage/></ProtectedRoute>}/>
        <Route path="/transcription" element={<ProtectedRoute><TranscriptionDisplay/></ProtectedRoute>}/>
        <Route path="/contact" element={<ContactPage/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/signup" element={<Signup/>}/>
        
      </Routes>
      <Footer/>
    </Router>
    </>
  );
}

export default App;
