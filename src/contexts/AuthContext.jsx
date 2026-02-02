import { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { ref, get, onValue, off } from 'firebase/database';
import { auth, googleProvider, db } from '../firebaseConfig';

// Create the Authentication Context
const AuthContext = createContext(null);

// Custom hook to use the Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is in the authorized_users list
  const checkAuthorization = async (user) => {
    if (!user) {
      setIsAuthorized(false);
      return false;
    }

    try {
      const authRef = ref(db, `smart_home/authorized_users/${user.uid}`);
      const snapshot = await get(authRef);
      const authorized = snapshot.exists() && snapshot.val() === true;
      setIsAuthorized(authorized);
      return authorized;
    } catch (error) {
      // Log detailed error for debugging
      console.error('Authorization check error details:', {
        code: error.code,
        message: error.message,
        uid: user.uid
      });
      setIsAuthorized(false);
      return false;
    }
  };

  // Login with Google
  const login = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // Authorization will be checked by onAuthStateChanged
      return result;
    } catch (error) {
      // Log detailed error for debugging
      console.error('Login error details:', {
        code: error.code,
        message: error.message,
        email: error.customData?.email,
        credential: error.credential
      });
      
      // Re-throw with original error for component to handle
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
      setIsAuthorized(false);
    } catch (error) {
      // Log detailed error for debugging
      console.error('Logout error details:', {
        code: error.code,
        message: error.message
      });
      throw error;
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  // Listen to real-time authorization status changes
  useEffect(() => {
    if (!currentUser) {
      setIsAuthorized(false);
      return;
    }

    // Subscribe to real-time updates for authorization status
    const authRef = ref(db, `smart_home/authorized_users/${currentUser.uid}`);
    
    const unsubscribe = onValue(authRef, (snapshot) => {
      const authorized = snapshot.exists() && snapshot.val() === true;
      setIsAuthorized(authorized);
      
      // Log authorization status changes for debugging
      console.log('Authorization status updated:', {
        uid: currentUser.uid,
        authorized,
        timestamp: new Date().toISOString()
      });
    }, (error) => {
      // Handle errors (e.g., permission denied)
      console.error('Authorization subscription error:', {
        code: error.code,
        message: error.message,
        uid: currentUser.uid
      });
      setIsAuthorized(false);
    });

    // Cleanup subscription when user changes or component unmounts
    return () => {
      off(authRef);
      unsubscribe();
    };
  }, [currentUser]);

  const value = {
    currentUser,
    isAuthorized,
    loading,
    login,
    logout,
    checkAuthorization: () => checkAuthorization(currentUser)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
