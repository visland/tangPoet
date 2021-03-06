import React from 'react'
import * as d3 from 'd3'
import AllData from '../Part/data/alldata.json'
import OnePoetry from './OnePoetry'
import '../Part/style/tooltip.less'

import bgimg from '../Part/style/bg.png'


export default class AllPoetry extends React.Component{

    componentWillMount(){      
        this.data  = AllData
        this.radius = 5
        this.padding = 3.8 // 调试
        this.group = [
            { "group": "1", "value": 943, "name": "留诗一首" },
            { "group": "2", "value": 323, "name": "小作两曲" },
            { "group": "3-5", "value": 294, "name": "三至五首" },
            { "group": "5-10", "value": 198, "name": "五至十首" },
            { "group": "10-50", "value": 208, "name": "十至五十" },
            { "group": "50+", "value": 155, "name": "高产诗人" },
        ]

        const { svgHeight } = this.props
        
        this.margin = ( this.radius + this.padding )* 2
        this.areaHeight = svgHeight * 0.79 //调试
        this.oneWide = this.radius * 2 + this.padding
        let a = Math.floor(this.areaHeight / this.oneWide)

        let comData1 = this.group.map(d => ({ group: d.group, name: d.name, b : Math.ceil(d.value / a) }))
        let comData2 = comData1.map(d => ({ group: d.group, name: d.name, b: d.b, groupWidth: d.b * this.oneWide}))
        this.groupdata = this.compute(comData2)
        this.computeSvg = this.computeSvg.bind(this)
        this.drawmsvg = this.drawmsvg.bind(this)
        
    }
    compute(data){
        let padding = this.oneWide * 2
        let transform = this.oneWide + this.padding;
        for (let i = 0; i < data.length; i ++){
            data[i].transform = transform 
            let a = data[i].groupWidth
            transform = transform + a + padding
        }
        return data
    }
    render(){
        const { viewbox, gstyle, svgHeight} = this.props

        return (
            <div className="chart-style" id="allpoetry">
                <svg viewBox={viewbox} preserveAspectRatio="xMinYMin meet">
                    <image xlinkHref={bgimg} width="100%" height="100%"></image>
                    {this.groupdata.map((d, i) => 
                        <OnePoetry 
                            key={i}
                            transform={`translate(${d.transform + 100}, ${svgHeight* 0.05 + 90})`} 
                            data={this.choosedata(d.group)}
                            dotR={this.radius}
                            numW={d.b}
                            oneWide={this.oneWide}
                            height={this.areaHeight}
                            name={d.name}
                            width={d.groupWidth}
                        />
                    )}
                        <g className="legend" transform="translate(950, 30)">
                            <g fill="#75623a">
                                <circle cx="0" cy="0" r="10"></circle>
                                <text dx="45" dy="7">男诗人</text>
                            </g>
                            <g fill="#c33e3c">
                                <circle cx="100" cy="0" r="10"></circle>
                                <text dx="145" dy="7">女诗人</text>
                            </g>
                        </g>
                </svg>
            </div>
        )
    }
    choosedata(group) {
        let data = this.data.filter(d => d.group === group)
        return data 
    }
    componentDidMount(){    
        window.addEventListener('resize', this.drawmsvg)
        
        this.drawmsvg()

        this.drawTooltip()  
        // window.onresize = function () { this.drawmsvg() } 
    }
    componentWillUnmount(){
        // window.removeEventListener('resize', this.drawmsvg)
    }
    computeSvg(data, d){
        for (d of data) {
            let dom = d3.select(`[id=${d.name}]`).node(),
                cx = dom.getAttribute("cx"),
                cy = dom.getAttribute("cy"),
                f = dom.getCTM()

                d.x = cx * f.a + cy * f.c + f.e 
                d.y = cx * f.b + cy * f.d + f.f
            }
            return data
    }
    drawmsvg(){
        console.log('draw')
        let choosed = [
            { "name": "白居易", "pic":"bjy", "x": 0, "y": 0, "fame": "《长恨歌》", "sex": "male", "value": 3009 },
            { "name": "薛涛","pic":"xt", "x": 0, "y": 0, "fame": "《送友人》", "sex": "female", "value": 93 },
            { "name": "元稹","pic":"yz", "x": 0, "y": 0, "fame": "《离思》", "sex": "male", "value": 910 },
            { "name": "张若虚", "pic":"zrx","x": 0, "y": 0, "fame": "《春江花月夜》", "sex": "male", "value": 3 },
            { "name": "王之涣", "pic":"wzh","x": 0, "y": 0, "fame": "《登鹳雀楼》", "sex": "male", "value": 7 }            
        ]
        // function computeSvg(data, d){
        //     for( d of data){
        //         let dom = d3.select(`[id=${d.name}]`).node(),
        //             cx = dom.getAttribute("cx"),
        //             cy = dom.getAttribute("cy"),
        //             f = dom.getCTM()
              
        //             d.x = cx * f.a + cy * f.c + f.e 
        //             d.y = cx * f.b + cy * f.d + f.f
        //     }
        //     return data
        // }
        let computedData = this.computeSvg(choosed)

        d3.selectAll("#msvg").html('')
        d3.selectAll(".msvg").html('')

        d3.select("#allpoetry").append("div").attr("id", "msvg")
            .selectAll(".msvg")
            .data(computedData)
            .enter()
            .append("div")
            .style("position", "absolute")
            .style("left", d => `${d.x}px`)
            .style("top", d => `${d.y}px`)
            .attr("class", d => `msvg ${ d.sex === "male" ? "male" : "female"}`)

        let msvg = d3.selectAll(".msvg")

        let Pic = msvg.append("div").attr("class","pic"),
            Info = msvg.append("div").attr("class", "info")
        
        Pic.append("img").attr("src", d =>`${require("./img/" + d.pic + ".jpg")}`); 
        Info.append("p").attr("class", "name").html(d => `${d.name}`)
        Info.append("p").html(d => `代表作${d.fame}`)
        Info.append("p").html(d => `作诗${d.value}首`)
    }
    drawTooltip(){
        let tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")

        let Name = tooltip.append("div"),
            Info = tooltip.append("div")
        Name.append("p"); Info.append("p")

        d3.selectAll(".poetry-style circle")
            .on("mouseover", function (d) {
                tooltip
                    .attr('visibility', 'visible')
                tooltip
                    .style("left", (d3.event.pageX - 25) + "px")
                    .style("top", (d3.event.pageY - 25) + "px");

                let sex = d3.event.target.getAttribute("data-sex"),
                    sexClass = sex === "male" ? "male" : "female"

                Name.attr("class", `${sexClass} poetry-name`).select("p").html(d3.event.target.id)
                Info.attr("class", `${sexClass} poetry-info`).select("p").html("作诗" + d3.event.target.getAttribute("data-value") + "首")

                d3.select("#msvg").selectAll(".msvg")
                    .attr('visibility', 'hidden')
                    .selectAll(".pic")
                    .attr("class", "noanimate")

                d3.select("#msvg").selectAll(".msvg")
                    .selectAll(".info")
                    .attr("class", "noanimateI")
            })

            .on("mouseout", function (d) {
                tooltip
                    .attr('visibility', 'hidden')
                    .selectAll("div").attr("class", "")
                Name.select("p").html("")
                Info.select("p").html("")

                d3.select("#msvg").selectAll(".msvg")
                    .attr('visibility', 'visible')
                    .selectAll(".noanimate")
                    .attr("class", "pic")
                    
                d3.select("#msvg").selectAll(".msvg")
                    .selectAll(".noanimateI")
                    .attr("class", "info")
            })
    }
}
