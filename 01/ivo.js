function randn_bm() {
  var u = 0, v = 0;
  while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while(v === 0) v = Math.random();
  let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
  num = num / 10.0 + 0.5; // Translate to 0 -> 1
  if (num > 1 || num < 0) return randn_bm(); // resample between 0 and 1
  return num;
}

Vue.component("chartivo", {
  data: function() {
    return {
      svg: null,
      x: null,
      y: null,
      chartWidth: null,
      chartHeight: null
    };
  },
  template: '<div ref="ref_chart"></div>',
  mounted: function() {
    self = this;
    this.render();
    
    var yPosValues = numbers.random.distribution.normal(10000, 0.0554568941733117, 0.852701247874279);
    yPosValues = yPosValues.map(function(x){
      return (x * Math.sqrt(130)) + 5;
    }); 
    
    setInterval(function() {
      var bucket = parseInt(randn_bm()*10);
      if(bucket > 1 && bucket < 10){
        floor = numbers.statistic.quantile(yPosValues,bucket,10);
        roof = numbers.statistic.quantile(yPosValues,bucket+1,10);
        temp = yPosValues.filter(function(x){return x > floor && x < roof;});
        self.addHLine(_.sample(temp));
      }
    }, 10);

    window.addEventListener("resize", this.render);
  },

  methods: {
    addHLine: function(yPos) {
     var internalBucket;
        if(Math.abs(yPos) <= 3 ){
            internalBucket = 0
        }
        else if(Math.abs(yPos) > 3 && Math.abs(yPos) <= 5){
            internalBucket = 1
        }
        else if(Math.abs(yPos) > 5 && Math.abs(yPos) <= 10){
            internalBucket = 2
        }
        else if(Math.abs(yPos) > 10){
            internalBucket = 3
        }
     console.log(this.y(yPos));
        // .attr("transform", "translate(0, " + this.y(yPos) + ")")
        this.svg.append("g")
        .append("rect")
        .attr("x", this.x.bandwidth()*(0.5))
        .attr("width", this.x.bandwidth()/2)
        .attr("y", this.y(yPos))
        .attr("height", "2" )
        .attr("class", "dist")
        .transition()
        .duration(5000)
        .style("opacity", "0");

        
    },

    getWindowWidth() {
      return this.$refs.ref_chart.clientWidth;
    },

    render: function() {
      d3.select("svg").remove();
      // set the dimensions and margins of the graph
      var margin = { top: 20, right: 30, bottom: 30, left: 50 }

      var width = this.getWindowWidth() - margin.left - margin.right
      var height = this.getWindowWidth() / 3 - margin.top - margin.bottom;

      this.chartWidth = width;
      this.chartHeight = height;

      // set the ranges
    //   var x = d3.scaleTime().range([0, width]);
        var x = d3.scaleBand()
          .range([0, width])
          .padding(0.5);
      var y = d3.scaleLinear().range([height, 0]);

    //   this.x = d3.scaleTime().range([0, width]);
    this.x = d3.scaleBand()
    .range([0, width])
    .padding(0.1);
      this.y = d3.scaleLinear().range([height, 0]);

      // define the line
      var valueline = d3
        .line()
        .x(function(d) {
          return x(d.year);
        })
        .y(function(d) {
          return y(d.population);
        });

      // append the svg obgect to the body of the page
      // appends a 'group' element to 'svg'
      // moves the 'group' element to the top left margin
      this.svg = d3
        .select(this.$el)
        .append("svg")
        .attr("width", "100%")
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // Get the data
      self = this;
      d3.csv("data.1.csv", function(error, data) {
        if (error) throw error;
        // format the data
        data.forEach(function(d) {
          d.buckets = d.buckets;
          
        });

        // Scale the range of the data
        x.domain(data.map(function(d) { return d.buckets; }));
        y.domain([-20, 20 ]);

        self.x.domain(data.map(function(d) { return d.buckets; }));
        self.y.domain([-20, 20 ]);

     

        // Add the X Axis
        self.svg
          .append("g")
          .attr("transform", "translate(0," + height + ")")
          .attr("class", "axis--1 text")
          .call(d3.axisBottom(x));

        // Add the Y Axis
        self.svg.append("g")
        .attr("class", "axis--1")
        .call(d3.axisLeft(y));

        // add the Y gridlines
        self.svg
          .append("g")
          .attr("class", "grid")
          .call(
            d3
              .axisLeft(y)
              .tickSize(-width)
              .tickFormat("")
          );
      });
    }
  }
});
