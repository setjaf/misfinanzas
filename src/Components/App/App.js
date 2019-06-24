import React, {Component} from 'react';
import {FDtoJSON} from '../../Utils/FDtoJSON.js';
import firebase from '../../Utils/firebase.js';
import {Switch,Route} from 'react-router-dom';

import Login from './Login/Login';
import Resumen from './Resumen/Resumen';
import './App.css';
import { firestore } from 'firebase';

const db = firebase.firestore();


export default class App extends Component{
  constructor(props){
    super(props);

    this.state = {
      uid:null,
      nombre:null,
      correo:null,
      imgPerfil:null,
      presupuesto:null,      
    }

    this.userDoc = null;

    this.loginUser = this.loginUser.bind(this);

  }  

  registrarIngreso(event){
    const esto = this;

    event.preventDefault();

    let ingresos = this.state.ingresosFijos.slice(0,this.state.ingresosFijos.length);

    let ingreso = FDtoJSON(new FormData(event.target));

    ingreso.registro = firebase.firestore.Timestamp.now();

    let presupuesto = db.collection('Usuarios').doc(this.state.uid).collection('Presupuestos').doc(this.state.presupuestoId);
    
    presupuesto.collection('Ingresos').add(ingreso).then(
      (docRef)=>{

        alert('Ingreso guardado');

        /*ingreso.id = docRef.id;

        ingresos.push(
          ingreso
        );

        esto.setState({
          ingresosFijos:ingresos,
        });*/

      }
    ).catch(
      ()=>alert('No se pudo guardar el ingreso')
    );
    event.target.reset();
  }

  loginUser(user){
    let esto = this;
    //console.log(db.collection('Usuarios').doc(this.state.uid).collection('Presupuestos'));
    let presupuesto; 

    db.collection('Usuarios').doc(user.uid).collection('Presupuestos').orderBy('Creado','desc').limit(1).get().then(
      (result)=>{
        if(result.empty){

          presupuesto = db.collection('Usuarios').doc(user.uid).collection('Presupuestos').add({
            Creado:firebase.firestore.FieldValue.serverTimestamp(),
            dineroDisponible: 0,
            dineroLibre: 0,
          });
          
        }else{
          presupuesto = result.docs[0];
        }

        this.setState({
          logged:true,
          nombre: user.displayName,
          correo: user.email,
          imgPerfil: user.photoURL,
          uid: user.uid,
          presupuestoId: presupuesto.id,
        });
               
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
                (<Resumen />)
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
