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

    this.loginUser = this.loginUser.bind(this);
    this.iniciarNuevoPresupuesto = this.iniciarNuevoPresupuesto.bind(this);
    this.insertarIngresosGastosNuevoPresupuesto = this.insertarIngresosGastosNuevoPresupuesto.bind(this);
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
            esto.setState({
              logged: true,
              nombre: user.displayName,
              correo: user.email,
              imgPerfil: user.photoURL,
              uid: user.uid,
              presupuestoId: presupuesto.id,
            });            
          });
        }else{
          presupuesto = result.docs[0];
          esto.setState({
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
    
  }

  iniciarNuevoPresupuesto(){
    const esto = this;
    let presupuesto = db.collection('Usuarios').doc(this.state.uid).collection('Presupuestos').doc(this.state.presupuestoId);
    presupuesto.update({
      Finalizado:firebase.firestore.Timestamp.now(),
    }).then((e)=>{
      let dineroDisponible, dineroLibre;
      
      presupuesto.get().then((doc)=>{
        
        dineroDisponible = doc.data().dineroDisponible;
        dineroLibre = doc.data().dineroLibre;


        db.collection('Usuarios').doc(esto.state.uid).collection('Presupuestos').add({
          Creado:firebase.firestore.FieldValue.serverTimestamp(),
          dineroDisponible: Number(dineroDisponible),
          dineroLibre: Number(dineroLibre),
        }).then((doc)=>{
          presupuesto=doc;
          
          esto.insertarIngresosGastosNuevoPresupuesto(dineroDisponible,presupuesto.id,esto.state.presupuestoId);
         
          
        });        

      });
      
    });
  }

  insertarIngresosGastosNuevoPresupuesto(dineroDisponible, nuevoPresupuestoId, viejoPresupuestoId){
    const esto =this;
    db.collection('Usuarios').doc(this.state.uid).collection('Presupuestos').doc(nuevoPresupuestoId).collection('Ingresos').add({
      concepto: 'Dinero disponible presupuesto anterior',
      importe: dineroDisponible,
      registro: firebase.firestore.Timestamp.now(),
    }).then((e)=>{
      console.log(e);
    });

    db.collection('Usuarios').doc(this.state.uid).collection('Presupuestos').doc(viejoPresupuestoId).collection('Gastos').where("importeActual",">","0").get().then(
      (qs)=>{
        qs.docs.forEach(
          (doc)=>{
            db.collection('Usuarios').doc(this.state.uid).collection('Presupuestos').doc(nuevoPresupuestoId).collection('Gastos').add(doc.data());
          }
        );

        esto.setState({
          presupuestoId: nuevoPresupuestoId,
        }); 
        
      }
    );
  }

  render(){
    return(
      <Switch>
        <Route
          path={'/'}
          render={
            ()=>{
              return (this.state.logged?
                (
                <div>
                  <Resumen uid={this.state.uid} presupuestoId={this.state.presupuestoId}/>
                  <button onClick={()=>{this.iniciarNuevoPresupuesto()}}> Iniciar Nuevo Presupuesto</button>
                </div>
                )
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
