import React,{Component} from 'react';
import Ingresos from './Ingresos/Ingresos';
import Gastos from './Gastos/Gastos';

export default class Resumen extends Component{

  constructor(props){
    super(props);

    this.state={
      dineroDisponible:0,
      dineroLibre:0,
    }
  }

  render(){
    return(
      <div>
        <h1>Dinero disponible</h1>
        <Ingresos uid={this.props.uid} presupuestoId={this.props.presupuestoId}/>
  
        <Gastos uid={this.props.uid} presupuestoId={this.props.presupuestoId}/>
      </div>
      
    );
  }
}