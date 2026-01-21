import { Button, InputNumber, Statistic } from 'antd'

export default function Analysis() {
  return (
    <div id="page-analysis" className="page-container active">
      <div className="preview-area">
        <img
          src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80"
          className="preview-img"
          alt="食物照片预览"
        />
        <div className="bounding-box" style={{ top: '30%', left: '20%', width: '40%', height: '40%' }}>
          <div className="bounding-tag">牛油果沙拉</div>
        </div>
      </div>

      <div className="analysis-sheet">
        <div className="total-kcal">
          <Statistic value={420} valueStyle={{ color: 'var(--primary)' }} />
          <span>Kcal 总热量</span>
        </div>

        <div className="food-list">
          <div className="food-item-row">
            <div className="food-info">
              <span className="food-name">生菜基底</span>
              <span className="food-meta">150g · 25 kcal</span>
            </div>
            <InputNumber
              min={0}
              defaultValue={1}
              size="small"
            />
          </div>

          <div className="food-item-row">
            <div className="food-info">
              <span className="food-name">牛油果</span>
              <span className="food-meta">半个 · 160 kcal</span>
            </div>
            <InputNumber
              min={0}
              defaultValue={1}
              size="small"
            />
          </div>

          <div className="food-item-row">
            <div className="food-info">
              <span className="food-name">全麦面包丁</span>
              <span className="food-meta">30g · 80 kcal</span>
            </div>
            <InputNumber
              min={0}
              defaultValue={1}
              size="small"
            />
          </div>
        </div>

        <div className="analysis-actions-fixed">
          <Button className="btn secondary">
            去咨询 AI
          </Button>
          <Button className="btn" type="primary">
            确认记录
          </Button>
        </div>
      </div>
    </div>
  )
}
