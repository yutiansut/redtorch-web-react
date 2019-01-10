import React, { PureComponent } from 'react';
import {MultiGrid,AutoSizer} from 'react-virtualized'
import { connect } from 'dva';
import {numberFormat,sortBySymbol} from '../../../../utils/RtUtils'
import {DIRECTION_TRANSLATER,DIRECTION_LONG,DIRECTION_SHORT} from '../../../../utils/RtConstant'
import styles from './Grid.less';

const STYLE = {
  border: '1px solid #E8E8E8',
};
const STYLE_BOTTOM_LEFT_GRID = {
  borderRight: '1px solid #E8E8E8',
  backgroundColor: '#fafafa',
};
const STYLE_BOTTOM_RIGHT_GRID = {
  outline:'none',
};
const STYLE_TOP_LEFT_GRID = {
  borderBottom: '2px solid #E8E8E8',
  borderRight: '2px solid #E8E8E8',
  fontWeight: 'bold',
};
const STYLE_TOP_RIGHT_GRID = {
  borderBottom: '2px solid #E8E8E8',
  fontWeight: 'bold',
};

const INLINE_LABEL_STYLE={
  display:'inline-block',
  float:'left',
  color:'#AAA',
  paddingLeft:'2px'
}

@connect(({operation}) => ({
  operation
}))
class Center extends PureComponent {
  constructor(props) {
    super(props);
    this.state={
      // hoveredColumnIndex: null,
      // hoveredRowIndex: null,
      clickedRowIndex: null
    }
 }

  render() {
    const {
      list,
      dispatch,
      height,
    } = this.props;
    const {
      // hoveredRowIndex,
      clickedRowIndex
    } = this.state;

    let tableHeight;
    if(height === undefined){
      tableHeight = 600;
    }else{
      tableHeight = height;
    }


    const tableList = [];

    let columnCount = 0;
    {
      const headerMap = new Map();
      headerMap.set(columnCount,"产品"); // 0
      headerMap.set(columnCount+=1,"账户"); // 1
      headerMap.set(columnCount+=1,"方向"); // 2
      headerMap.set(columnCount+=1,"持仓"); // 3
      headerMap.set(columnCount+=1,"今仓"); // 4
      headerMap.set(columnCount+=1,"均价"); // 5
      headerMap.set(columnCount+=1,"盈利价差"); // 6
      headerMap.set(columnCount+=1,"逐笔浮盈"); // 7
      headerMap.set(columnCount+=1,"盯市浮盈"); // 8
      headerMap.set(columnCount+=1,"保证金"); // 9
      headerMap.set(columnCount+=1,"合约价值"); // 10
      tableList.push(headerMap)
      columnCount+=1
    }

    
    if(list !== undefined){
      list.sort(sortBySymbol).forEach(element => {
        tableList.push(element)
      });
    }

    const rowCount = tableList.length;
    
    const multiGridRef = React.createRef();

    const cellRenderer=({columnIndex, key, rowIndex, style})=>{

      // const hoveredCellClass = rowIndex === hoveredRowIndex ? styles.hoveredCell : '';
      const hoveredCellClass = rowIndex === clickedRowIndex ? styles.hoveredCell : '';
      

      const handleDoubleClick=()=>{

        const subscribeData = {
          symbol:tableList[rowIndex].symbol,
          exchange:tableList[rowIndex].exchange,
          gatewayID:tableList[rowIndex].gatewayID
        }
  
        dispatch({
          type: 'operation/subscribe',
          payload: subscribeData
        });

      }

      const handleClick = ()=>{
        const {updateTradeForm} = this.props
        if(updateTradeForm!==null&&updateTradeForm!==undefined){
          updateTradeForm({
            symbol:tableList[rowIndex].symbol
          })
        }
        if(rowIndex!==0){
          this.setState({clickedRowIndex:rowIndex})
        }
      }
      
      // 第0行 表头
      if(rowIndex === 0){
        return (
          <div className={styles.headerCell} key={key} style={style}>
            <div>{tableList[rowIndex].get(columnIndex)}</div>
          </div>
        );

      }

      // 第0列 产品信息
      if(columnIndex === 0){
        return (
          <div onClick={handleClick} onDoubleClick={handleDoubleClick} onFocus={() => undefined} className={`${styles.cell}  ${styles.displayRight} ${hoveredCellClass} ${styles.cursorPointer}`} key={key} style={style}>
            <div className={`${styles.colorYellow}`}>{tableList[rowIndex].rtSymbol}<br /></div>
            <div>{tableList[rowIndex].contractName}</div>
          </div>
        );
      }
      

      // 第1列 账户
      if(columnIndex === 1){
        return (
          <div className={`${styles.cell}  ${styles.displayRight}  ${hoveredCellClass}`} key={key} style={style}>
            <div>{tableList[rowIndex].accountID}<br /></div>
            <div style={{color:"#BBB"}}>{tableList[rowIndex].gatewayDisplayName}</div>
          </div>
        )
      }

      // 第2列 方向
      if(columnIndex === 2){
        if(tableList[rowIndex].direction === DIRECTION_LONG){
          return(
            <div className={`${styles.cell}  ${styles.displayCenter} ${hoveredCellClass} ${styles.colorBuy}`} key={key} style={style}>
              {DIRECTION_TRANSLATER.get(tableList[rowIndex].direction)}
            </div>
          )
        }
        
        if(tableList[rowIndex].direction === DIRECTION_SHORT){
          return(
            <div className={`${styles.cell}  ${styles.displayCenter} ${hoveredCellClass} ${styles.colorSell}`} key={key} style={style}>
              {DIRECTION_TRANSLATER.get(tableList[rowIndex].direction)}
            </div>
          )
        }
        return(
          <div className={`${styles.cell}  ${styles.displayCenter} ${hoveredCellClass}`} key={key} style={style}>
            {DIRECTION_TRANSLATER.get(tableList[rowIndex].direction)}
          </div>
        )

      }
      // 第3列 持仓
      if(columnIndex === 3){
        return (
          <div className={`${styles.cell}  ${styles.displayRight} ${styles.colorCount} ${hoveredCellClass}`} key={key} style={style}>
            <div><span style={INLINE_LABEL_STYLE}>持仓：</span>{tableList[rowIndex].position}<br /></div>
            <div><span style={INLINE_LABEL_STYLE}>冻结：</span>{tableList[rowIndex].frozen}</div>
          </div>
        )
      }
      
      // 第4列 今仓
      if(columnIndex === 4){
        return (
          <div className={`${styles.cell}  ${styles.displayRight}  ${styles.colorCount} ${hoveredCellClass}`} key={key} style={style}>
            <div><span style={INLINE_LABEL_STYLE}>持仓：</span>{tableList[rowIndex].tdPosition}<br /></div>
            <div><span style={INLINE_LABEL_STYLE}>冻结：</span>{tableList[rowIndex].tdFrozen}</div>
          </div>
        )
      }

      // 第5列 均价
      if(columnIndex === 5){
        return (
          <div className={`${styles.cell}  ${styles.displayRight}  ${hoveredCellClass}`} key={key} style={style}>
            <div><span style={INLINE_LABEL_STYLE}>持仓：</span>{numberFormat(tableList[rowIndex].price,4)}<br /></div>
            <div><span style={INLINE_LABEL_STYLE}>开仓：</span>{numberFormat(tableList[rowIndex].openPrice,4)}</div>
          </div>
        )
      }
      
      // 第6列 盈利价差
      if(columnIndex === 6){
        return (
          <div className={`${styles.cell}  ${styles.displayRight}  ${hoveredCellClass}`} key={key} style={style}>
            <div><span style={INLINE_LABEL_STYLE}>持仓：</span>{numberFormat(tableList[rowIndex].priceDiff,4)}<br /></div>
            <div><span style={INLINE_LABEL_STYLE}>开仓：</span>{numberFormat(tableList[rowIndex].openPriceDiff,4)}</div>
          </div>
        )
      }

      // 第6列 逐笔浮盈
      if(columnIndex === 7){
        if(tableList[rowIndex].openPositionProfit > 0){
          return(
            <div className={`${styles.cell}  ${styles.displayRight} ${hoveredCellClass} ${styles.colorBuy}`} key={key} style={style}>
              <div>{numberFormat(tableList[rowIndex].openPositionProfit,4)}<br /></div>
              <div>{numberFormat(tableList[rowIndex].openPositionProfitRatio*100,2)}%</div>
            </div>
          )
        }
        
        if(tableList[rowIndex].openPositionProfit < 0){
          return(
            <div className={`${styles.cell}  ${styles.displayRight} ${hoveredCellClass} ${styles.colorSell}`} key={key} style={style}>
              <div>{numberFormat(tableList[rowIndex].openPositionProfit,4)}<br /></div>
              <div>{numberFormat(tableList[rowIndex].openPositionProfitRatio*100,2)}%</div>
            </div>
          )
        }

        return(
          <div className={`${styles.cell}  ${styles.displayRight} ${hoveredCellClass}`} key={key} style={style}>
            <div>{numberFormat(tableList[rowIndex].openPositionProfit,4)}<br /></div>
            <div>{numberFormat(tableList[rowIndex].openPositionProfitRatio*100,2)}%</div>
          </div>
        )

      }

      // 第7列 盯市浮盈
      if(columnIndex === 8){
        if(tableList[rowIndex].positionProfit > 0){
          return(
            <div className={`${styles.cell}  ${styles.displayRight} ${hoveredCellClass} ${styles.colorBuy}`} key={key} style={style}>
              <div>{numberFormat(tableList[rowIndex].positionProfit,4)}<br /></div>
              <div>{numberFormat(tableList[rowIndex].positionProfitRatio*100,2)}%</div>
            </div>
          )
        }
        
        if(tableList[rowIndex].positionProfit < 0){
          return(
            <div className={`${styles.cell}  ${styles.displayRight} ${hoveredCellClass} ${styles.colorSell}`} key={key} style={style}>
              <div>{numberFormat(tableList[rowIndex].positionProfit,4)}<br /></div>
              <div>{numberFormat(tableList[rowIndex].positionProfitRatio*100,2)}%</div>
            </div>
          )
        }
        return(
          <div className={`${styles.cell}  ${styles.displayRight} ${hoveredCellClass}`} key={key} style={style}>
            <div>{numberFormat(tableList[rowIndex].positionProfit,4)}<br /></div>
            <div>{numberFormat(tableList[rowIndex].positionProfitRatio*100,2)}%</div>
          </div>
        )
      }

      // 第8列 保证金
      if(columnIndex === 9){
        return (
          <div className={`${styles.cell}  ${styles.displayRight}  ${hoveredCellClass}`} key={key} style={style}>
            <div><span style={INLINE_LABEL_STYLE}>经济商：</span>{numberFormat(tableList[rowIndex].useMargin,2)}<br /></div>
            <div><span style={INLINE_LABEL_STYLE}>交易所：</span>{numberFormat(tableList[rowIndex].exchangeMargin,2)}</div>
          </div>
        )
      }

      // 第9列 合约价值
      if(columnIndex === 10){
        return (
          <div className={`${styles.cell}  ${styles.displayRight}  ${hoveredCellClass}`} key={key} style={style}>
            {numberFormat(tableList[rowIndex].contractValue,2)}
          </div>
        )
      }

      return (
        <div />
      )
    }

    const getColumnWidth=({index}) => {
      switch (index) {
        case 0:
            return 150;
        case 1:
            return 180;
        case 2:
          return 60;
        case 5:
            return 150;
        case 6:
            return 150;
        case 8:
            return 150;
        case 9:
            return 180;
        default:
          return 120;
      }
    }
    
    return (

      <AutoSizer disableHeight>
        {({width}) => (
          <MultiGrid
            ref={multiGridRef}
            fixedColumnCount={1}
            fixedRowCount={1}
            cellRenderer={cellRenderer}
            columnWidth={getColumnWidth}
            columnCount={columnCount}
            enableFixedColumnScroll
            enableFixedRowScroll
            height={tableHeight}
            rowHeight={50}
            rowCount={rowCount}
            style={STYLE}
            styleBottomLeftGrid={STYLE_BOTTOM_LEFT_GRID}
            styleBottomRightGrid={STYLE_BOTTOM_RIGHT_GRID}
            styleTopLeftGrid={STYLE_TOP_LEFT_GRID}
            styleTopRightGrid={STYLE_TOP_RIGHT_GRID}
            width={width}
            hideTopRightGridScrollbar
            hideBottomLeftGridScrollbar
          />
        )}
      </AutoSizer>
    );
  }
}

export default Center;
