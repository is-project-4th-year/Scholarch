import { doc, setDoc, getDoc, updateDoc, collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './firebaseConfig';

// 1. CREATE USER PROFILE (on signup)
export const createUserProfile = async (profileData) => {
  const userId = auth.currentUser.uid;
  
  try {
    await setDoc(doc(db, 'users', userId), {
      profile: {
        name: profileData.name,
        email: profileData.email,
        age: profileData.age,
        gender: profileData.gender,
        program: profileData.program,
        university: profileData.university,
        learningStyle: profileData.learningStyle
      },
      behavior: {
        studyHours: 0,
        attendance: 0,
        resources: 0,
        extracurricular: 0,
        motivation: 0,
        internet: 0,
        onlineCourses: 0,
        discussions: 0,
        assignmentCompletion: 0,
        eduTech: 0,
        stressLevel: 0,
        lastUpdated: serverTimestamp()
      },
      predictions: {
        predictedExamScore: null,
        modelVersion: null,
        datePredicted: null,
        keyDrivers: [],
        recommendation: ""
      },
      progress: {
        history: [],
        avgStudyHours: 0,
        avgStressLevel: 0,
        scoreTrend: "No data yet"
      },
      createdAt: serverTimestamp()
    });
    
    console.log('User profile created successfully');
    return { success: true };
  } catch (error) {
    console.error('Error creating user profile:', error);
    return { success: false, error };
  }
};

// 2. GET USER DATA
export const getUserData = async () => {
  const userId = auth.currentUser.uid;
  
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    } else {
      return { success: false, error: 'No user data found' };
    }
  } catch (error) {
    console.error('Error getting user data:', error);
    return { success: false, error };
  }
};

// 3. UPDATE BEHAVIOR DATA
export const updateBehaviorData = async (behaviorData) => {
  const userId = auth.currentUser.uid;
  
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'behavior': {
        ...behaviorData,
        lastUpdated: serverTimestamp()
      }
    });
    
    console.log('Behavior data updated successfully');
    return { success: true };
  } catch (error) {
    console.error('Error updating behavior data:', error);
    return { success: false, error };
  }
};

// 4. UPDATE SPECIFIC BEHAVIOR FIELD
export const updateBehaviorField = async (field, value) => {
  const userId = auth.currentUser.uid;
  
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      [`behavior.${field}`]: value,
      'behavior.lastUpdated': serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating behavior field:', error);
    return { success: false, error };
  }
};

// 5. SAVE PREDICTION
export const savePrediction = async (predictionData) => {
  const userId = auth.currentUser.uid;
  
  try {
    // Update user document
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'predictions': {
        predictedExamScore: predictionData.predictedExamScore,
        modelVersion: predictionData.modelVersion,
        datePredicted: serverTimestamp(),
        keyDrivers: predictionData.keyDrivers,
        recommendation: predictionData.recommendation
      }
    });
    
    // Also save to predictions collection for historical tracking
    await addDoc(collection(db, 'predictions'), {
      userId: userId,
      predictedExamScore: predictionData.predictedExamScore,
      modelVersion: predictionData.modelVersion,
      datePredicted: serverTimestamp(),
      keyDrivers: predictionData.keyDrivers,
      recommendation: predictionData.recommendation
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error saving prediction:', error);
    return { success: false, error };
  }
};

// 6. UPDATE PROGRESS
export const updateProgress = async (progressData) => {
  const userId = auth.currentUser.uid;
  
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const currentHistory = userDoc.data()?.progress?.history || [];
    
    // Add new entry to history
    const newHistory = [
      ...currentHistory,
      {
        date: serverTimestamp(),
        predictedScore: progressData.predictedScore
      }
    ];
    
    await updateDoc(userRef, {
      'progress': {
        history: newHistory,
        avgStudyHours: progressData.avgStudyHours,
        avgStressLevel: progressData.avgStressLevel,
        scoreTrend: progressData.scoreTrend
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating progress:', error);
    return { success: false, error };
  }
};

// 7. GET USER PREDICTION HISTORY
export const getPredictionHistory = async () => {
  const userId = auth.currentUser.uid;
  
  try {
    const q = query(
      collection(db, 'predictions'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const predictions = [];
    
    querySnapshot.forEach((doc) => {
      predictions.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, data: predictions };
  } catch (error) {
    console.error('Error getting prediction history:', error);
    return { success: false, error };
  }
};

// 8. UPDATE PROFILE
export const updateProfile = async (profileData) => {
  const userId = auth.currentUser.uid;
  
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'profile': profileData
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, error };
  }
};
