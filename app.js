import { app } from "./config.js";

// login / signin / signup imports
import {
  onAuthStateChanged,
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// firestore imports
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// firebase authentication
const auth = getAuth();

// google auth provider
const provider = new GoogleAuthProvider();

// firestore
const db = getFirestore(app);


// getting login email, password inputs, button and an error paragraph
let lemail = document.querySelector("#lemail"); // get email to login user
let lpassword = document.querySelector("#lpassword"); // get password to login user
let lbtn = document.querySelector("#lbtn"); // get login btn
let errorPara = document.querySelector("#errorPara"); // get error paragraph


// login function
if (lbtn) {
  lbtn.addEventListener("click", () => {
    signInWithEmailAndPassword(auth, lemail.value, lpassword.value)
      .then(async (userCredential) => {
        const user = userCredential.user;
        const userUid = user.uid;

        const userRef = doc(db, "users", userUid);

        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          localStorage.setItem("userUid", userUid);
          location.href = "../user/index.html";
        } else {
          const adminRef = doc(db, "restaurants", userUid);
          const adminDocSnap = await getDoc(adminRef);

          if (adminDocSnap.exists()) {
            localStorage.setItem("adminUid", userUid);
            location.href = "../register/admin/admin.html";
          }
        }
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = errorCode.slice(5).toUpperCase();
        const errMessage = errorMessage.replace(/-/g, " ");
        errorPara.innerText = errMessage;
        setTimeout(() => {
          errorPara.innerHTML = "";
        }, 3000);
      });
  });
}

if (lpassword) {
  lpassword.addEventListener("keypress", (e) => {
    if (e.key == "Enter") {
      lbtn.click();
    }
  });
}

// getting google sign in button
const googleSignInBtn = document.getElementById("googleSignInBtn");

if (googleSignInBtn) {
  googleSignInBtn.addEventListener("click", () => {
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;

        const user = result.user;

        const userUid = user.uid;

        const userRef = doc(db, "users", userUid);

        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          localStorage.setItem("userUid", userUid);
          location.href = "../user/index.html";
        } else {
          const adminRef = doc(db, "restaurants", userUid);
          const adminDocSnap = await getDoc(adminRef);

          if (adminDocSnap.exists()) {
            localStorage.setItem("adminUid", userUid);
            location.href = "../register/admin/admin.html";
          }
        }

        let userData = {
          sname: user.displayName,
          semail: user.email,
        };

        await setDoc(doc(db, "users", user.uid), {
          // collection name,   unique id of user
          ...userData, // setting array in a database
          userid: user.uid, // also user id in the database
        });

        localStorage.setItem("userUid", user.uid);

        location.href = "../user/index.html";
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const credential = GoogleAuthProvider.credentialFromError(error);
        console.log(errorMessage);
      });
  });
}

