import React, { useState } from 'react';
import Auth from './components/Auth';
import MainPage from './components/MainPage';
import DetailsPage from './components/DetailsPage';
import './App.css';

const App = () => {
  const [user, setUser] = useState(null);
  const [memosByDay, setMemosByDay] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedMemo, setSelectedMemo] = useState(null);

  const handleSignIn = (user) => setUser(user);

  const handleFetchMemos = (callback) => setMemosByDay(callback);
  const handleSelectDay = (day) => setSelectedDay(day);
  const handleSelectMemo = (memo) => setSelectedMemo(memo);

  const handleChangeMemo = (callback) => setMemosByDay(callback);
  const handleBack = () => setSelectedMemo(null);

  return (
    <div className='App'>
      {!user && <Auth onSignIn={handleSignIn} />}
      {user && !selectedMemo && <MainPage user={user}
        previousMemosByDay={memosByDay}
        previousSelectedDay={selectedDay}
        onFetchMemos={handleFetchMemos}
        onSelectDay={handleSelectDay}
        onSelectMemo={handleSelectMemo}
      />}
      {user && selectedMemo && <DetailsPage user={user}
        memo={selectedMemo}
        onChangeMemo={handleChangeMemo}
        onBack={handleBack}
      />}
    </div>
  );
};

export default App;
