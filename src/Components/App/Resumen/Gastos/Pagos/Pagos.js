import React, {Component} from 'react';
import firebase from '../../../../../Utils/firebase';
import { FDtoJSON } from '../../../../../Utils/FDtoJSON';

const db = firebase.firestore();

export default class Pagos extends Component{
	constructor(props){
		super(props);

		this.state={
			IdGasto:this.props.IdGasto,
			pagos: [],
		}

	}

	componentDidMount=()=>{

		this.inicializarPagos();
		this.iniciarListenerActualizaciones();
	}

	inicializarPagos = () => {
		const esto = this;
    let pagos = db.collection('Usuarios').doc(this.props.uid).collection('Presupuestos').doc(this.props.presupuestoId).collection('Gastos').doc(this.state.IdGasto).collection('Pagos');
    pagos.get().then((qs) => {
      let pagos = [];
      qs.docs.forEach(
        (doc) => {
          const data = doc.data();
          let pago = { ...data }
          pago.id = doc.id;
          pago.registro = pago.registro.toDate();
          pagos.push(pago);
          return pago;
        }
      );
      esto.setState({
        pagos: pagos,
      });
    })
	}

	iniciarListenerActualizaciones = () => {
    console.log('Iniciar actualizaciones');

    this.presupuesto = db.collection('Usuarios').doc(this.props.uid).collection('Presupuestos').doc(this.props.presupuestoId);

    this.presupuesto.collection('Gastos').doc(this.state.IdGasto).collection('Pagos').onSnapshot((qs) => {
      console.log(qs);
      //console.log(qs.docChanges())
      /*qs.docChanges().forEach((change) => {

        if (change.type === 'modified') {
          //console.log(change.doc.data());

          this.actualizarPago(change.doc.id, change.doc.data());
        }

			});*/
			
			this.inicializarPagos();

    });

  }

	render(){
		return(
			<div>
				<details>
					<summary><b>Pagos</b></summary>
					<ul>
						{
							this.state.pagos.map((pago)=>{
								return(<li key={pago.id}>
									{`$${pago.importe} - ${pago.registro.getFullYear()}-${pago.registro.getMonth() + 1 < 10 ? '0' : ''}${pago.registro.getMonth() + 1}-${pago.registro.getDate() < 10 ? '0' : ''}${pago.registro.getDate()}`}
								</li>)
							})
						}
					</ul>
				</details>
				
			</div>
		);
	}
}