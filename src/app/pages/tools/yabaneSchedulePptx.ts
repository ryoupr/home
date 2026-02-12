/**
 * PPTX generation logic for YabaneSchedule.
 * Extracted from YabaneSchedulePage to reduce component size.
 */

interface LaneTask {
  id: string;
  title: string;
  color: string;
  laneIndex: number;
  xStart: number;
  width: number;
}

interface ColorDef {
  bg: string;
  hex: string;
}

export interface PptxExportParams {
  categories: string[];
  tasks: Array<{ category: string }>;
  totalTimelineWidth: number;
  unitWidth: number;
  leftCols: string[];
  rightCols: string[];
  timelineUnits: Date[];
  viewMode: string;
  useJapaneseHolidays: boolean;
  holidays: Record<string, string>;
  laneTasksByCategory: Record<string, LaneTask[]>;
  colors: ColorDef[];
  formatDate: (date: Date | string) => string;
  getISOWeek: (date: Date) => number;
  getFiscalInfo: (date: Date) => { fy: number; label: string };
}

const PPTX_SHAPE_OFFSET_X = -0.02;
const TITLE_X = 0.5;
const TITLE_Y = 0.2;
const TITLE_H = 0.5;
const CATEGORY_COL_WIDTH_INCH = 1.5;
const HEADER_HEIGHT = 0.6;
const MIN_ROW_HEIGHT = 0.7;
const TASK_V_STEP = 0.35;
const TASK_SHAPE_H = 0.25;
const ROW_PADDING = 0.3;
const TASK_Y_OFFSET = 0.15;

export async function generateYabanePptx(
  pptx: any,
  params: PptxExportParams
): Promise<void> {
  const {
    categories,
    tasks,
    totalTimelineWidth,
    unitWidth,
    leftCols,
    rightCols,
    timelineUnits,
    viewMode,
    useJapaneseHolidays,
    holidays,
    laneTasksByCategory,
    colors,
    formatDate,
    getISOWeek,
    getFiscalInfo,
  } = params;

  pptx.layout = 'LAYOUT_WIDE';
  const slide = pptx.addSlide();
  slide.addText('矢羽スケジュール', {
    x: TITLE_X,
    y: TITLE_Y,
    w: 9,
    h: TITLE_H,
    fontSize: 24,
    bold: true,
    color: '333333',
  });

  const START_X = TITLE_X,
    START_Y = 1.0,
    SLIDE_WIDTH = 13.33;
  const TIMELINE_WIDTH = SLIDE_WIDTH - CATEGORY_COL_WIDTH_INCH - START_X * 2;
  if (totalTimelineWidth === 0) throw new Error('タイムライン幅が0です');
  const pxToInch = TIMELINE_WIDTH / totalTimelineWidth;
  const SPECIAL_COL_WIDTH = 80;
  const leftColWidthInch = SPECIAL_COL_WIDTH * pxToInch;
  const unitWidthInch = unitWidth * pxToInch;
  const rightColWidthInch = SPECIAL_COL_WIDTH * pxToInch;

  const activeCategories = categories.filter((cat) =>
    tasks.some((t) => t.category === cat)
  );
  if (activeCategories.length === 0) {
    throw new Error('出力するタスクがありません');
  }

  if (viewMode === 'day' && timelineUnits.length > 90) {
    throw new Error(
      '日次モードの表示範囲が広すぎます（90日以内に絞ってください）'
    );
  }

  const colWidths = [
    CATEGORY_COL_WIDTH_INCH,
    ...Array(leftCols.length).fill(leftColWidthInch),
    ...Array(timelineUnits.length).fill(unitWidthInch),
    ...Array(rightCols.length).fill(rightColWidthInch),
  ];

  const categoryHeights = activeCategories.map((category) => {
    const laneTasks = laneTasksByCategory[category] || [];
    const maxLane = Math.max(-1, ...laneTasks.map((t) => t.laneIndex));
    return Math.max(MIN_ROW_HEIGHT, (maxLane + 1) * TASK_V_STEP + ROW_PADDING);
  });
  const tableRowHeights = [HEADER_HEIGHT, ...categoryHeights];

  const headerOptions = {
    fill: 'F1F5F9',
    bold: true,
    align: 'center' as const,
    valign: 'middle' as const,
    border: { pt: 1, color: 'CBD5E1' },
    fontSize: 10,
    margin: 0,
  };

  const headerRow: any[] = [{ text: '工程区分', options: headerOptions }];
  leftCols.forEach((c) =>
    headerRow.push({
      text: c,
      options: { ...headerOptions, fill: 'E2E8F0' },
    })
  );
  timelineUnits.forEach((date) => {
    const isHolidayMode = viewMode === 'day';
    const isHoliday =
      isHolidayMode && useJapaneseHolidays && holidays[formatDate(date)];
    const isSun = isHolidayMode && date.getDay() === 0;
    let label = '';
    if (viewMode === 'day') label = `${date.getMonth() + 1}/${date.getDate()}`;
    else if (viewMode === 'week') label = `W${getISOWeek(date)}`;
    else if (viewMode === 'month')
      label = `${date.getFullYear()}年\n${date.getMonth() + 1}月`;
    else if (viewMode === 'year') label = `${date.getFullYear()}年`;
    else if (viewMode === 'fy') label = getFiscalInfo(date).label;
    headerRow.push({
      text: label,
      options: {
        ...headerOptions,
        fill: isHoliday || isSun ? 'FFE4E6' : 'F1F5F9',
      },
    });
  });
  rightCols.forEach((c) =>
    headerRow.push({
      text: c,
      options: { ...headerOptions, fill: 'E2E8F0' },
    })
  );

  const tableRows: any[][] = [headerRow];
  activeCategories.forEach((cat) => {
    const row: any[] = [
      {
        text: cat,
        options: {
          bold: true,
          valign: 'middle',
          align: 'center',
          border: { pt: 1, color: 'CBD5E1' },
          margin: 0,
        },
      },
    ];
    for (
      let i = 0;
      i < leftCols.length + timelineUnits.length + rightCols.length;
      i++
    )
      row.push({
        text: '',
        options: { border: { pt: 1, color: 'F1F5F9' }, margin: 0 },
      });
    tableRows.push(row);
  });

  const totalTableWidthInch = colWidths.reduce((sum, w) => sum + w, 0);
  slide.addTable(tableRows, {
    x: START_X,
    y: START_Y,
    w: totalTableWidthInch,
    colW: colWidths,
    rowH: tableRowHeights,
    autoPage: false,
  });

  activeCategories.forEach((category, catIdx) => {
    const laneTasks = laneTasksByCategory[category] || [];
    let currentCatY = START_Y + HEADER_HEIGHT;
    for (let i = 0; i < catIdx; i++) currentCatY += categoryHeights[i];
    laneTasks.forEach((task) => {
      let shapeX_px = task.xStart,
        shapeW_px = task.width;
      if (shapeX_px < 0) {
        shapeW_px += shapeX_px;
        shapeX_px = 0;
      }
      if (shapeX_px + shapeW_px > totalTimelineWidth)
        shapeW_px = totalTimelineWidth - shapeX_px;
      const shapeX =
        START_X +
        CATEGORY_COL_WIDTH_INCH +
        shapeX_px * pxToInch +
        PPTX_SHAPE_OFFSET_X;
      const shapeW = shapeW_px * pxToInch;
      const shapeY = currentCatY + TASK_Y_OFFSET + task.laneIndex * TASK_V_STEP;
      if (shapeW > 0) {
        const colorObj = colors.find((c) => c.bg === task.color) || colors[0];
        slide.addShape(pptx.ShapeType.chevron, {
          x: shapeX,
          y: shapeY,
          w: shapeW,
          h: TASK_SHAPE_H,
          fill: { color: colorObj.hex },
          line: { color: 'FFFFFF', width: 1 },
        });
        slide.addText(task.title, {
          x: shapeX,
          y: shapeY,
          w: shapeW,
          h: TASK_SHAPE_H,
          fontSize: 8,
          color: 'FFFFFF',
          bold: true,
          align: 'center',
          valign: 'middle',
        });
      }
    });
  });

  await pptx.writeFile({
    fileName: `yabane-schedule-${formatDate(new Date())}.pptx`,
  });
}
