import React, {Component} from 'react';
import firebase from '../../Utils/firebase.js';
import {Switch,Route} from 'react-router-dom';

import Login from './Login/Login';
import Resumen from './Resumen/Resumen';
import './App.css';

const db = firebase.firestore();


export default class App extends Component{
  constructor(props){
    super(props);

    this.state = {
      uid:null,
      nombre:null,
      correo:null,
      imgPerfil:null,
      presupuestoId:null,      
    }

    this.userDoc = null;

    this.loginUser = this.loginUser.bind(this);

  }   

  loginUser(user){
    let esto = this;
    //console.log(db.collection('Usuarios').doc(this.state.uid).collection('Presupuestos'));
    let presupuesto; 

    db.collection('Usuarios').doc(user.uid).collection('Presupuestos').orderBy('Creado','desc').limit(1).get().then(
      (result)=>{
        if(result.empty){

          db.collection('Usuarios').doc(user.uid).collection('Presupuestos').add({
            Creado:firebase.firestore.FieldValue.serverTimestamp(),
            dineroDisponible: 0.0,
            dineroLibre: 0.0,
          }).then((doc)=>{
            presupuesto=doc;
            this.setState({
              logged:true,
              nombre: user.displayName,
              correo: user.email,
              imgPerfil: user.photoURL,
              uid: user.uid,
              presupuestoId: presupuesto.id,
            });            
          });
        }else{
          presupuesto = result.docs[0];
          this.setState({
            logged:true,
            nombre: user.displayName,
            correo: user.email,
            imgPerfil: user.photoURL,
            uid: user.uid,
            presupuestoId: presupuesto.id,
          });
        }

        
               
      }
    );

    console.log(presupuesto);  
    

  }

  render(){
    return(
      <Switch>
        <Route
          path={'/'}
          render={
            ()=>{
              return (this.state.logged?
                (<Resumen uid={this.state.uid} presupuestoId={this.state.presupuestoId}/>)
              :
                (<Login loginUsuario={(user)=>this.loginUser(user)}/>)
              );
            }
          }
        />
      </Switch>
    );
  }


}
