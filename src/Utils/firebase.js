import * as firebase from 'firebase/app';
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC8Dx6f5GWM8wbBxORFRL2ky6BVlMX6jkY",
  authDomain: "misfinanzas-4edc8.firebaseapp.com",
  databaseURL: "https://misfinanzas-4edc8.firebaseio.com",
  projectId: "misfinanzas-4edc8",
  storageBucket: "misfinanzas-4edc8.appspot.com",
  messagingSenderId: "767739153344",
  appId: "1:767739153344:web:d0e2a44be39fc96d"
};

firebase.initializeApp(firebaseConfig);

export default firebase;
