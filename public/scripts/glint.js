var GlintProducts = React.createClass({
	loadProductsFromServer: function() {
		$.ajax({
			url: this.props.pie_url,
			dataType: 'json',
			cache: false,
			success: function(data) {
				this.setState({
					products: data
				});
				
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.pie_url, status, err.toString());
			}.bind(this)
		});
	},
	getInitialState: function() {
		return ({
			products:[],
			productDetail:'',
			filter: 'All'    
		});
	},
	componentDidMount: function() {
		this.loadProductsFromServer();
	},
	handleYearFilter: function(filter) {
		this.setState({
			filter: filter
		});
	},
	handleProductUpdate: function(id, field, val) {
		var products = this.state.products;
		products[id][field] = val;
		this.setState({
			products: products
		});
	},
	ShowProductDetail: function(product){
		this.setState({
			productDetail: product
		});
	},
	render: function() {
		var years = {};
		var filteredProdRevSum = {};
		var filteredProducts = [];
		this.state.products.forEach((product) => {
			years[product.year] = product.year;
			if(this.state.filter == 'All' || product.year == this.state.filter){
				if(this.state.productDetail && product.product == this.state.productDetail){
					filteredProducts.push(product);
				}
				if(filteredProdRevSum[product.product] != undefined){
					filteredProdRevSum[product.product].y += product.revenue;
				}
				else
					filteredProdRevSum[product.product] = {product:product.product, y:product.revenue, legendMarkerType:"square"};
			}
		});
		years['All'] = 'All';
		var filteredProdRevSumVals = Object.keys(filteredProdRevSum).map(function(key) {
		    return filteredProdRevSum[key];
		});
		return (
			<div>
				<YearFilter 
				filter={this.state.filter}
				years={years}
				onUserInput={this.handleYearFilter}/>
			<PieChart products={filteredProdRevSumVals} 
						filter={this.state.filter}
						onShowDetail={this.ShowProductDetail}>
			</PieChart>
			{this.state.productDetail != '' && filteredProducts.length > 0 &&
			<ProductDetail filter={this.state.filter}
								filteredProducts={filteredProducts}
								revAvg = {filteredProdRevSum[this.state.productDetail].y/filteredProducts.length}
								onUserInput={this.handleProductUpdate}
								productDetail={this.state.productDetail}/>
							}			
		</div>
	);
	}
});

class YearFilter extends React.Component {
	constructor(props) {
		super(props);
		this.handleChange = this.handleChange.bind(this);
	}
	handleChange() {
		this.props.onUserInput(
			this.refs.filterInput.value
		);
	}
	  
	render(){
		var yearOption = Object.keys(this.props.years)
		return (
			<div className="leftContent">
				<h2>Fiscal Year</h2>
				<select value={this.props.filter} onChange={this.handleChange} ref="filterInput">
				{yearOption.map((year) =>
							<option key={year}
							value={year}>{year}</option>
				)}
				</select>
			</div>
		);
	}	
} 

class PieChart extends React.Component {
	constructor(props) {
		super(props);
		this.showDetail = this.showDetail.bind(this);
	}
	showDetail(product) {
		this.props.onShowDetail(
			product
		);
	}
	render() {
		var revByProd = this.props.products;
		var charTitle = "Revenue	by Product, " + this.props.filter;
		var chart = new CanvasJS.Chart("chartContainer",
		{
			theme: "theme1",
			title:{
				text: charTitle,
				fontFamily: "sans-serif",
				fontColor: "black"
	
			},
			toolTip:{
				enabled:true,
				content:"{product}"
			},

			data: [
				{
					click: function(e){ 
						this.showDetail(e.dataPoint.product);
					},
					showDetail:this.showDetail,
					type: "pie",
					animationEnabled: true,
					showInLegend: true,
					indexLabelPlacement: "inside",
					yValueFormatString: "#0.#,,. Million",
					indexLabelFontColor: "MistyRose",       
					indexLabelLineColor: "black",
					indexLabel: "{y}",
					legendText: "{product}",
					dataPoints: revByProd
				}
			]
		});
		chart.render();
		return(<div></div>);
	}
}

class ProductDetail extends React.Component {
	constructor(props) {
		super(props);
		this.handleChange = this.handleChange.bind(this);
	}
	handleChange(id, field, oldVal, e) {
		var val = e.target.innerText.trim();
		switch(field) {
		    case 'revenue':
				  var tmpVal = val.match(/[0-9\-.]/g);
				  if(tmpVal == null || tmpVal.length == 0){
					  tmpVal = 0;
				  }else{
					  tmpVal = parseFloat(tmpVal.join(''));
				  		if(isNaN(tmpVal))
					  	 return;
			  	  }
				  if(val.toLowerCase().indexOf('million') != -1)
					  val = tmpVal * 1000000;
				  else
					  val = tmpVal;
				  /*if(oldVal == val){
					  return;
				  }*/
		        break;
		    case 'year':
				 var testYear = /^[0-9]+$/;
				 if(val.length != 4 || !testYear.test(val) || oldVal == val){
					 e.target.innerText = oldVal;
					 return;
				 }
		        break;
		    default:
				 if(val == "" || oldVal.toLowerCase() == val.toLowerCase()){
					 e.target.innerText = oldVal;
					 return;
				 }
				 break;
		}
		
		this.props.onUserInput(
			id,
			field,
			val
		);
	}
	
	render(){
		var rows = [];
		this.props.filteredProducts.forEach((product) => {
			var rev = product.revenue/1000000;
			if (Math.abs(rev) < 0.01)
				rev = 0;
			rev = "$" + rev + " Million";
			
			rows.push(<tr key={product.id}>
				<td contentEditable onBlur={this.handleChange.bind(this, product.id, 'year', product.year)}>{product.year}</td>
				<td contentEditable onBlur={this.handleChange.bind(this, product.id, 'product', product.product)}>{product.product}</td>
				<td contentEditable onBlur={this.handleChange.bind(this, product.id, 'country', product.country)}>{product.country}</td>
				<td className={(product.revenue < this.props.revAvg)?"bold_td":""} contentEditable onBlur={this.handleChange.bind(this, product.id, 'revenue', product.revenue)}>{rev}</td>
		
				</tr>
			);
		});
		return(
			<div className="rightContent">
			<h2>Revenue Report, {this.props.filter}, {this.props.productDetail}</h2>
			<div className="productTable">
				<table>
				<thead>
				<tr>
				<th>Fiscal Year</th>
				<th>Product</th>
				<th>Region</th>
				<th>Revenue</th>
				</tr>
				</thead>
				<tbody>
				{rows}
				</tbody>
				</table>
			</div>
			</div>
		);
	}
}

ReactDOM.render(
	<GlintProducts pie_url="/api/pie" />,
	document.getElementById('content')
);