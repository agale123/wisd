import pandas as pd
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import make_column_transformer
import math


def clean_data(events):
    # Count successful passes leading up to this one
    possession = None
    count = 0
    for index, row in events.sort_values(['match_id', 'index']).iterrows():
        if row['possession'] != possession:
            count = 0
            possession = row['possession']
        else:
            count += 1
        events.at[index, 'prior_passes'] = count

    # Clean the data
    events.pass_outcome = events.pass_outcome.fillna('Complete')
    events.pass_technique = events.pass_technique.fillna('Other')
    events.pass_body_part = events.pass_body_part.fillna('Other')
    events.pass_type = events.pass_type.fillna('Other')
    events = events.fillna(False)
    events['location_x'] = [p[0] for p in events['location']]
    events['location_y'] = [p[1] for p in events['location']]

    # Simplify positions
    events['position'] = events['position'].str.replace('Right ', '')
    events['position'] = events['position'].str.replace('Left ', '')
    events['position'] = events['position'].str.replace('Attacking ', '')
    events['position'] = events['position'].str.replace('Center ', '')
    events['position'] = events['position'].str.replace('Defensive ', '')

    # Calculate attackers/defenders near the pass cone

    # Calculate the distance between two points
    def dist(a, b):
        return math.sqrt((a[0]-b[0])**2 + (a[1]-b[1])**2)

    # Calculate the angle from point a to b
    def angle(a, b):
        if b[0] >= a[0]:
            return -1 * math.atan((a[1]-b[1])/(a[0]-b[0]))
        elif b[1] >= a[1]:
            return -1 * math.pi - math.atan((a[1]-b[1])/(a[0]-b[0]))
        else:
            return math.pi - math.atan((a[1]-b[1])/(a[0]-b[0]))

    # Check if a given player is near an event
    def is_nearby(event, player):
        # If players are within a roughly 3 yard radius, consider them nearby
        player_dist = dist(event['location'], player['location'])
        if player_dist < 3:
            return True
        # If a player is further than 120% of the pass distance, they are not nearby
        if player_dist > 1.25 * event['pass_length']:
            return False

        # If the player is within pi/8 degrees from the pass, consider them nearby
        player_angle = angle(event['location'], player['location'])
        if abs(event['pass_angle'] - player_angle) < math.pi / 4:
            return True
        elif player_angle < 0 and event['pass_angle'] > 0 and math.pi * 2 + player_angle - event['pass_angle'] < math.pi / 4:
            return True
        elif player_angle > 0 and event['pass_angle'] < 0 and math.pi * 2 + event['pass_angle'] - player_angle < math.pi / 4:
            return True
        return False

    for index, event in events.iterrows():
        if not event['freeze_frame']:
            events.at[index, 'nearby_teammates'] = 0
            events.at[index, 'nearby_opponents'] = 0
            continue
        nearby_teammates = 0
        nearby_opponents = 0
        for player in event['freeze_frame']:
            if not player['actor'] and is_nearby(event, player):
                if player['teammate']:
                    nearby_teammates += 1
                else:
                    nearby_opponents += 1
        events.at[index, 'nearby_teammates'] = nearby_teammates
        events.at[index, 'nearby_opponents'] = nearby_opponents

    # Remove ones with low feature importance that don't impact accuracy
    events = events[['position', 'location_x', 'location_y', 'duration', 'pass_length',
                    'pass_angle', 'pass_height', 'pass_body_part', 'under_pressure', 'pass_outcome',
                     'pass_switch', 'pass_cross', 'prior_passes', 'nearby_teammates', 'nearby_opponents']]

    # Use one-hot encoding to get quantitative features
    transformer = make_column_transformer(
        (OneHotEncoder(sparse=False), [
         'position', 'pass_height', 'pass_body_part']),
        remainder='passthrough')
    transformed = transformer.fit_transform(events)
    transformed_events = pd.DataFrame(
        transformed, columns=transformer.get_feature_names())

    # Split into features and response variables
    response = transformed_events['pass_outcome'] == 'Complete'
    features = transformed_events.drop(columns=['pass_outcome'])

    return (response, features)
