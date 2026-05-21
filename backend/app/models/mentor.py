from typing import Literal

from pydantic import BaseModel, Field


MentorAction = Literal["explain_this", "give_hint"]
MentorMode = Literal["beginner", "engineer"]
MentorTone = Literal["supportive", "technical", "encouraging"]


class MentorLessonContext(BaseModel):
    id: str | None = None
    title: str | None = None
    description: str | None = None
    topic: str | None = None
    difficulty: str | None = None
    learning_objectives: list[str] = Field(default_factory=list)
    required_concepts: list[str] = Field(default_factory=list)


class MentorMisconception(BaseModel):
    id: str
    type: str
    severity: str
    message: str
    related_event_id: str | None = None
    suggested_focus: str


class MentorRequest(BaseModel):
    action: MentorAction
    mode: MentorMode
    selected_event: dict | None = None
    selected_node: dict | None = None
    validation_summary: dict = Field(default_factory=dict)
    misconceptions: list[MentorMisconception] = Field(default_factory=list)
    lesson: MentorLessonContext | None = None


class MentorResponse(BaseModel):
    message: str
    tone: MentorTone
    next_suggested_action: str
    safety_notes: list[str] = Field(default_factory=list)
    learning_constraints: list[str] = Field(default_factory=list)
