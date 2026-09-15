import pandas as pd
import numpy as np

# Approximate bounding boxes for Northeast Indian States
STATE_BOUNDS = {
    'Arunachal Pradesh': {'min_lat': 26.5, 'max_lat': 29.5, 'min_lon': 91.5, 'max_lon': 97.5},
    'Assam': {'min_lat': 24.0, 'max_lat': 28.0, 'min_lon': 89.5, 'max_lon': 96.0},
    'Meghalaya': {'min_lat': 25.0, 'max_lat': 26.2, 'min_lon': 89.8, 'max_lon': 92.8},
    'Manipur': {'min_lat': 23.8, 'max_lat': 25.7, 'min_lon': 92.9, 'max_lon': 94.8},
    'Mizoram': {'min_lat': 21.9, 'max_lat': 24.5, 'min_lon': 92.2, 'max_lon': 93.4},
    'Nagaland': {'min_lat': 25.2, 'max_lat': 27.0, 'min_lon': 93.3, 'max_lon': 95.2},
    'Tripura': {'min_lat': 22.9, 'max_lat': 24.5, 'min_lon': 91.1, 'max_lon': 92.3},
    'Sikkim': {'min_lat': 27.0, 'max_lat': 28.1, 'min_lon': 88.0, 'max_lon': 88.9},
}

def correct_coordinates(df):
    print("Correcting coordinates...")
    for state, bounds in STATE_BOUNDS.items():
        mask = df['state'] == state
        n_points = mask.sum()
        
        # Generate new random coordinates within the correct bounds for the state
        new_lats = np.random.uniform(bounds['min_lat'], bounds['max_lat'], n_points)
        new_lons = np.random.uniform(bounds['min_lon'], bounds['max_lon'], n_points)
        
        df.loc[mask, 'latitude'] = new_lats
        df.loc[mask, 'longitude'] = new_lons
        
    return df

def main():
    df = pd.read_csv('data/SANKET_ML_Ready_Dataset_2018_2025_20000.csv')
    df = correct_coordinates(df)
    df.to_csv('data/SANKET_ML_Ready_Dataset_2018_2025_20000.csv', index=False)
    print("Dataset successfully corrected and overwritten.")

if __name__ == "__main__":
    main()
