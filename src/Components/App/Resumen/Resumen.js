import React,{Component} from 'react';
import firebase from '../../../Utils/firebase.js';
import Ingresos from './Ingresos/Ingresos';
import Gastos from './Gastos/Gastos';

const db = firebase.firestore();

export default class Resumen extends Component{

  constructor(props){
    super(props);

    this.state={
      dineroDisponible:0,
      dineroLibre:0,
    }

    this.presupuesto = db.collection('Usuarios').doc(this.props.uid).collection('Presupuestos').doc(this.props.presupuestoId);;
    
    this.presupuesto.onSnapshot((ds)=>{
      console.log(ds);
      this.actualizarDinero(ds.data());
      /*console.log(qs.docChanges())
      qs.docChanges().map((change)=>{

        if(change.type=='modified'){
          console.log(change.doc.data());
          
          this.actualizarGasto(change.doc.id,change.doc.data());          
        }
        
      });*/      
    });

    this.actualizarDinero=this.actualizarDinero.bind(this);

  }

  actualizarDinero(presupuestoObj){
    this.setState({
      dineroDisponible:presupuestoObj.dineroDisponible,
      dineroLibre:presupuestoObj.dineroLibre,
    });
  }

  render(){
    return(
      <div>
        <h3>Dinero disponible</h3>
        <h4>${this.state.dineroDisponible}</h4>
        <h3>Dinero libre</h3>
        <h4>${this.state.dineroLibre}</h4>
        <Ingresos uid={this.props.uid} presupuestoId={this.props.presupuestoId}/>
  
        <Gastos uid={this.props.uid} presupuestoId={this.props.presupuestoId}/>
      </div>
      
    );
  }
}