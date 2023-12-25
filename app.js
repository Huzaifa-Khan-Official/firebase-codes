import { app } from "./config.js";

// login / signin / signup imports
import {
  onAuthStateChanged,
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// firestore imports
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  onSnapshot,
  query,
  deleteDoc,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// storage imports
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// firebase authentication
const auth = getAuth();

// google auth provider
const provider = new GoogleAuthProvider();

// firestore
const db = getFirestore(app);

// Initialize Cloud Storage and get a reference to the service
const storage = getStorage();

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
          // user found
          localStorage.setItem("userUid", userUid);
          location.href = "../user/index.html";
        } else {
          // admin checking
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

let sbtn = document.querySelector("#sbtn"); // get signin btn
let semail = document.querySelector("#semail"); // get email to signin user
let spassword = document.querySelector("#spassword"); // get password to signin user
let sname = document.querySelector("#sname"); // get name of a user

// signup button
if (sbtn) {
  sbtn.addEventListener("click", () => {
    if (sname.value == "") {
      errorPara.innerText = "Please fill name field!";
      setTimeout(() => {
        errorPara.innerHTML = "";
      }, 3000);
    } else {
      // storing data in a array
      let userData = {
        sname: sname.value,
        semail: semail.value,
        spassword: spassword.value,
      };
      // creating user with eamil and password
      createUserWithEmailAndPassword(auth, userData.semail, userData.spassword)
        // email value  , password value
        .then(async (userCredential) => {
          const user = userCredential.user; // getting user from firebase
          await setDoc(doc(db, "users", user.uid), {
            // collection name,   unique id of user
            ...userData, // setting array in a database
            userid: user.uid, // also user id in the database
          });
          location.href = "../login/login.html";
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
    }
  });
}

if (spassword) {
  spassword.addEventListener("keypress", (e) => {
    if (e.key == "Enter") {
      sbtn.click();
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
          // user found
          localStorage.setItem("userUid", userUid);
          location.href = "../user/index.html";
        } else {
          // admin checking
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

// image url function
const downloadImageUrl = (file) => {
  return new Promise((resolve, reject) => {
    const restaurantImageRef = ref(
      storage,
      // storage location
      `restaurantImages/${adminUid}/${file.name}`
    );
    const uploadTask = uploadBytesResumable(restaurantImageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        switch (snapshot.state) {
          case "paused":
            break;
          case "running":
            spinnerBorder.style.display = "block";
            break;
        }
      },
      (error) => {
        reject(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref)
          .then((downloadURL) => {
            resolve(downloadURL);
          })
          .catch((error) => {
            reject(error);
          });
      }
    );
  });
};

const picInput = document.querySelector("#picInput");

// input file fuction
if (picInput) {
  picInput.addEventListener("change", async () => {
    if (picInput.files.length > 0) {
      // image file
      const file = picInput.files[0];
      imgUrl = await downloadImageUrl(file);
      spinnerBorder.style.display = "none";
      if (imgUrl) {
        picOutput.src = imgUrl;
      }
    }
  });
}

// get data of parent collection
const getDataOfParentCollection = async () => {
  // collection name => document Id
  const docRef = doc(db, "restaurants", localStorage.getItem("adminUid"));
  const docSnap = await getDoc(docRef);

  if (docSnap.data()) {
    // ......
  }
};

// updating a document
const updateDocument = async () => {
  // referance of the document which has to be updated
  // collection name => document Id
  const updateDocumentRef = doc(db, "restaurants", adminUid);

  await updateDoc(updateDocumentRef, {
    // ......
  });
};

// adding sub collection
const addSubcollection = async () => {
  // parent Collection => document Id => sub collection name
  await addDoc(collection(db, `restaurants/${adminUid}/menue`), {
    // ......
  });
};

// getting data from sub collection
const getDataFromSubCollection = () => {
  // parent collection name => document Id => sub collection name
  const q = query(collection(db, `restaurants/${adminUid}/menue`));

  // by using orderBy query
  // const q = query(collection(db, `restaurants/${adminUid}/menue`), orderBy("time"));

  onSnapshot(q, (data) => {
    data.docChanges().forEach((singleData) => {
      // .....
    });
  });
};

// deleting document from sub collection
const delDocFromSubCollec = async (id) => {
  // parent collection => document Id => sub collection => sub document id
  await deleteDoc(doc(db, `restaurants/${adminUid}/menue`, id));
};

// updating document of sub collection
const updDocFromSubCollec = async (id) => {
  // parent collection => document Id => sub collection => sub document id
  const docRef = doc(db, `restaurants/${adminUid}/menue`, id);

  await updateDoc(docRef, {
    // ....
  });
};
