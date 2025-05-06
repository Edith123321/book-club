from datetime import datetime
from app import db

class Meeting(db.Model):
    __tablename__ = "meetings"

    id = db.Column(db.Integer, primary_key=True)
    bookclub_id = db.Column(db.Integer, db.ForeignKey("bookclubs.id"))
    meeting_date = db.Column(db.DateTime, nullable=False)
    agenda = db.Column(db.String, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    # Foreign key to User
    creator_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)

    # Relationships
    creator = db.relationship("User", back_populates="created_meetings")
    bookclub = db.relationship("BookClub", back_populates="meetings")  # ✅ This was missing

    def __repr__(self):
        return f"<Meeting bookclub_id={self.bookclub_id} meeting_date={self.meeting_date} agenda={self.agenda}>"
