from models import db

class Meeting(db.Model):
    __tablename__ = 'meetings'

    id = db.Column(db.Integer, primary_key=True)
    book_club_id = db.Column(db.Integer, db.ForeignKey('book_clubs.id'), nullable=False)
    meeting_date = db.Column(db.String(50))  # Could be Date type if standardized
    meeting_time = db.Column(db.String(50))
    location = db.Column(db.String(255))
    agenda = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    book_club = db.relationship('BookClub', back_populates='meetings')

    def to_dict(self):
        return {
            'date': self.meeting_date,
            'time': self.meeting_time,
            'location': self.location,
            'agenda': self.agenda
        }