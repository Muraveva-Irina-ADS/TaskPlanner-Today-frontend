import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import '../styles/components.css';

const StagesList = ({ stages: initialStages, onReorder, onDelete, onStage }) => {
  const uniqueStages = Array.from(new Map(initialStages.map(item => [item.stage_id, item])).values()
    ).sort((a, b) => (a.order_stage_in_list || 0) - (b.order_stage_in_list || 0));

  const [stages, setStages] = useState(uniqueStages);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleDragStart = (index) => {
    setDraggedItem(index);
  };

  useEffect(() => {
    setStages(uniqueStages);
  }, [initialStages]);

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedItem === null) return;
    const newStages = [...stages];
    const [draggedStage] = newStages.splice(draggedItem, 1);
    newStages.splice(dropIndex, 0, draggedStage);
    const updatedStages = newStages.map((stage, idx) => ({
      ...stage,
      order_stage_in_list: idx + 1
    }));
    setDraggedItem(null);
    setDragOverIndex(null);
    if (onReorder) {
      onReorder(updatedStages.map(stage => ({
        id: stage.stage_id,
        order_stage_in_list: stage.order_stage_in_list
      })));
    }
  };

  return (
    <>
      <div className="projects-grid">
        {stages.map((stage, index) => {
          return (
            <div key={stage.id}
              className={`project-card ${dragOverIndex === index ? 'drag-over' : ''} ${draggedItem === index ? 'dragging' : ''}`}
              draggable onDragStart={() => handleDragStart(index)} onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)} onDragEnd={() => {setDraggedItem(null); setDragOverIndex(null);}}
              onClick={() => onStage(stage.stage_id)}>
              <div className="project-header">
                    <div className="header-left">
                        <span className="drag-handle" title="Перетащите, чтобы изменить порядок">⋮⋮</span>
                        <h3 className="project-name">{stage.stage_name}</h3>
                    </div>
                    <div className="header-right">
                      <span className={`task-status-badge`} style={{backgroundColor: stage.exec_color}} title = "Статус выполнения">{stage.exec_status_name}</span>
                        <Button variant="primary" className="btn-delete"
                            onClick={(e) => {e.stopPropagation();
                            if (window.confirm(`Этап ${stage.stage_name} будет удален без возможности восстановления. Продолжить?`)) {
                                onDelete(stage.stage_id);}}}>Удалить</Button>
                    </div>
              </div>
              <p className="project-description">{stage.description}</p>              
            </div>
          );
        })}
        {stages.length === 0 && (
          <div className="project-card" style={{ textAlign: 'center', color: 'red' }}>
            У вас нет этапов. Для создания нажмите на кнопку "Добавить этап"
          </div>
        )}
      </div>
    </>
  );
};

export default StagesList;