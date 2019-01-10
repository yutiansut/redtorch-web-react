import React, { PureComponent } from 'react';
import {Table} from 'antd';
import { connect } from 'dva';
import styles from './Tables.less';
import {DIRECTION_TRANSLATER,DIRECTION_LONG,DIRECTION_SHORT} from '../../../../utils/RtConstant'
import {numberFormat,sortBySymbol} from "../../../../utils/RtUtils"

const INLINE_LABEL_STYLE={
  display:'inline-block',
  float:'left',
  color:'#AAA',
  // paddingLeft:'2px'
}

@connect(({operation}) => ({
  operation
}))
class Center extends PureComponent {

  handleDblClick = (record)=>{
    const {dispatch} = this.props;

    const subscribeData = {
      symbol:record.symbol,
      exchange:record.exchange,
      gatewayID:record.gatewayID
    }

    dispatch({
      type: 'operation/subscribe',
      payload: subscribeData
    });
  }

  handleClick = (record)=>{
    const {updateTradeForm} = this.props
    if(updateTradeForm!==null&&updateTradeForm!==undefined){
      updateTradeForm({
        symbol:record.symbol
      })
    }
  }

  render() {
    const {
      list,
      pagination,
      scroll,
      bordered
    } = this.props;
    

    let tablePagination;
    if(pagination === undefined){
      tablePagination = false;
    }else{
      tablePagination = pagination;
    }

    let tableBordered;
    if(bordered === undefined){
      tableBordered = true;
    }else{
      tableBordered = bordered;
    }

    const tableList = [];
    if(list !== undefined){
      list.sort(sortBySymbol).forEach(element => {
        tableList.push(element)
      });
    }

    
    let tableScroll = {y: 250,x:1460};
    if(scroll !== undefined){
      tableScroll = {...tableScroll,...scroll};
    }

    const rtSymbolSet = new Set();
    const gatewaySet = new Set();
    tableList.forEach(record=>{  
      rtSymbolSet.add(record.rtSymbol)
      gatewaySet.add(`${record.gatewayDisplayName}(${record.gatewayID})?`)
    })
    const rtSymbolFilterArray = [];
    Array.from(rtSymbolSet).forEach(rtSymbol=>{
      rtSymbolFilterArray.push({text:rtSymbol,value:rtSymbol})
    })
    const gatewayFilterArray = [];
    Array.from(gatewaySet).forEach(gateway=>{
      gatewayFilterArray.push({text:gateway,value:gateway})
    })


    // const pagination = this.props.pagination;
    const columns = [{
      title: '产品',
      dataIndex: 'rtSymbol',
      width: 150,
      key:'rtSymbol',
      sorter: (a, b) => a.rtSymbol > b.rtSymbol,
      filters: rtSymbolFilterArray,
      onFilter: (value, record) =>record.rtSymbol === value,
      render: (text, record) => (
        <div className={`${styles.cursorPointer}`}>
          <div className={`${styles.colorYellow}`}>{record.rtSymbol}<br /></div>
          <div>{record.contractName}</div>
        </div>
      )
    }, {
      title: '账户',
      dataIndex: 'gatewayDisplayName',
      width: 180,
      filters:gatewayFilterArray,
      onFilter: (value, record) => `${record.gatewayDisplayName}(${record.gatewayID})?` === value,
      render: (text, record) => (
        <div className={`${styles.displayRight}`}>
          <div>{ record.accountID}<br /></div>
          <div style={{color:"#BBB"}}>{ record.gatewayDisplayName}</div>
        </div>
      )
    },  
    {
      title: '方向',
      dataIndex: 'direction',
      width: 60,
      render: (text, record) => {
        if(DIRECTION_LONG === record.direction){
          return(
            <span className={`${styles.colorBuy} ${styles.displayCenter}`}> 
              {DIRECTION_TRANSLATER.get(record.direction)}
            </span>
          );
        }
        if(DIRECTION_SHORT === record.direction){
          return (
            <span className={`${styles.colorSell} ${styles.displayCenter}`}> 
              {DIRECTION_TRANSLATER.get(record.direction)}
            </span>
          );
        }
        return (
          <span className={`${styles.displayCenter}`}> 
            {DIRECTION_TRANSLATER.get(record.direction)}
          </span>
        );
      }
    }, 
    {
      title: '持仓',
      dataIndex: 'position',
      width:  120,
      align: 'right',
      render:(text,record) => (
        <div className={`${styles.displayRight} ${styles.colorCount}`}>
          <div><span style={INLINE_LABEL_STYLE}>持仓：</span>{record.position}<br /></div>
          <div><span style={INLINE_LABEL_STYLE}>冻结：</span>{record.frozen}</div>
        </div>
      )
    }, {
      title: '今仓',
      dataIndex: 'tdPosition',
      width:  120,
      align: 'right',
      render:(text,record) => (
        <div className={`${styles.displayRight} ${styles.colorCount}`}>
          <div><span style={INLINE_LABEL_STYLE}>持仓：</span>{record.tdPosition}<br /></div>
          <div><span style={INLINE_LABEL_STYLE}>冻结：</span>{record.tdFrozen}</div>
        </div>
      )
    }, {
      title: '均价',
      dataIndex: 'price',
      width:  150,
      align: 'right',
      render:(text,record)=>(
        <div className={` ${styles.displayRight}`}>
          <div><span style={INLINE_LABEL_STYLE}>持仓：</span>{numberFormat(record.price,4)}<br /></div>
          <div><span style={INLINE_LABEL_STYLE}>开仓：</span>{numberFormat(record.openPrice,4)}</div>
        </div>
      )
    }, {
      title: '盈利价差',
      dataIndex: 'priceDiff',
      width:  120,
      align: 'right',
      render:(text,record)=>(
        <div className={`${styles.displayRight}`}>
          <div><span style={INLINE_LABEL_STYLE}>持仓：</span>{numberFormat(record.priceDiff,4)}<br /></div>
          <div><span style={INLINE_LABEL_STYLE}>开仓：</span>{numberFormat(record.openPriceDiff,4)}</div>
        </div>
      )
    }, {
      title: '逐笔浮盈',
      dataIndex: 'openPositionProfit',
      width:  120,
      align: 'right',
      render:(text,record)=>{
        if(record.openPositionProfit > 0){
          return(
            <div className={`${styles.displayRight} ${styles.colorBuy}`}>
              <div>{numberFormat(record.openPositionProfit,4)}<br /></div>
              <div>{numberFormat(record.openPositionProfitRatio*100,2)}%</div>
            </div>
          )
        }
        
        if(record.openPositionProfit < 0){
          return(
            <div className={`${styles.displayRight} ${styles.colorSell}`}>
              <div>{numberFormat(record.openPositionProfit,4)}<br /></div>
              <div>{numberFormat(record.openPositionProfitRatio*100,2)}%</div>
            </div>
          )
        }
    
        return(
          <div className={`${styles.displayRight}`}>
            <div>{numberFormat(record.openPositionProfit,4)}<br /></div>
            <div>{numberFormat(record.openPositionProfitRatio*100,2)}%</div>
          </div>
        )
      }
    }, {
      title: '盯市浮盈',
      dataIndex: 'positionProfit',
      width:  120,
      align: 'right',
      render:(text,record)=>{
        if( record.positionProfit > 0){
          return(
            <div className={`${styles.displayRight} ${styles.colorBuy}`}>
              <div>{numberFormat( record.positionProfit,4)}<br /></div>
              <div>{numberFormat( record.positionProfitRatio*100,2)}%</div>
            </div>
          )
        }
        
        if( record.positionProfit < 0){
          return(
            <div className={`${styles.displayRight} ${styles.colorSell}`}>
              <div>{numberFormat( record.positionProfit,4)}<br /></div>
              <div>{numberFormat( record.positionProfitRatio*100,2)}%</div>
            </div>
          )
        }
        return(
          <div className={`${styles.displayRight}`}>
            <div>{numberFormat( record.positionProfit,4)}<br /></div>
            <div>{numberFormat( record.positionProfitRatio*100,2)}%</div>
          </div>
        )
      }
    }, {
      title: '保证金',
      dataIndex: 'margin',
      width:  150,
      align: 'right',
      render:(text,record)=>(
        <div className={`${styles.displayRight}`}>
          <div><span style={INLINE_LABEL_STYLE}>经济商：</span>{numberFormat( record.useMargin,2)}<br /></div>
          <div><span style={INLINE_LABEL_STYLE}>交易所：</span>{numberFormat( record.exchangeMargin,2)}</div>
        </div>
      )
    }, {
      title: '合约价值',
      dataIndex: 'contractValue',
      width:  150,
      align: 'right',
      render:(text,record)=>(    
        <div className={`${styles.displayRight}`}>
          {numberFormat(record.contractValue,2)}
        </div>
      )
    }];




    return (
      <Table
        onRow={(record) => ({onDoubleClick:() => this.handleDblClick(record),onClick:()=>this.handleClick(record)})}   // 点击行
        rowKey='rtPositionID'
        size='small'
        columns={columns}
        dataSource={tableList}
        pagination={tablePagination}
        scroll={tableScroll}
        bordered={tableBordered}
      />
    );
  }
}

export default Center;
