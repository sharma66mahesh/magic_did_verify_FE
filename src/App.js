import './App.css';
import { Magic } from 'magic-sdk';
import { IconExtension } from '@magic-ext/icon';
import { useState } from 'react';

const BACKEND_URL = 'http://localhost:5000';

const magic = new Magic('pk_test_221FCC565FA90776', {
  extensions: [
    new IconExtension({
      rpcUrl: 'https://bicon.net.solidwallet.io/api/v3',
    }),
  ],
});

function App() {

  const [userMetadata, setUserMetadata] = useState(null);
  const [enteredEmail, setEnteredEmail] = useState('');

  const loginUser = async (e) => {
    try {
      e.preventDefault();
      await magic.auth.loginWithMagicLink({
          email: enteredEmail,
          showUI: true
      });
      alert('Successfully logged in');
      const metadata = await magic.user.getMetadata();
      console.log(metadata);
      setUserMetadata(metadata);
    } catch(e) {
      console.group('ERROR LOGGING IN WITH MAGIC');
      console.error(e);
      console.groupEnd();
    }
  }

  const verifyClaim = async () => {
    // generate DID token with email and walletAddress signature in it
    const userObj = {
      email: userMetadata.email,
      walletAddress: userMetadata.publicAddress
    };
    const idToken = await magic.user.generateIdToken({
      attachment: JSON.stringify(userObj)
    });

    console.log("-----------GENERATED ID TOKEN IS-------------");
    console.log(idToken);

    // send the id token to backend for user verification
    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          idToken,
          additionalData: JSON.stringify(userObj)
        })
      });

      const data = await response.json();
      console.log(data);
    } catch (e) {
      console.group('POST DID TO BACKEND');
      console.error(e);
      console.groupEnd();
    }
  }

  return (
    <div className="App">
      <form onSubmit={loginUser}>
        <input type='text' name='email' value={enteredEmail} onChange={(e) => setEnteredEmail(e.target.value.trim())} />
        <button disabled={userMetadata !== null ? true : false} type='submit'>Login</button>
      </form>
      <br/><br/><br/>
      <button disabled={userMetadata === null ? true : false} onClick={verifyClaim}>Verify data</button>
    </div>
  );
}

export default App;
