import ChatWidget from './components/ChatWidget';

function App() {
    return (
        <div>
            <ChatWidget
                apiEndpoint="http://localhost:3000"
                position="bottom-right"
                primaryColor="#007bff"
                title="Chat Support"
            />
        </div>
    );
}

export default App;
