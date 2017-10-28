interface TrainerCallbacks {
  
}

class Trainer {
  private _trainerCallbacks: TrainerCallbacks;

  constructor(trainerCallbacks: TrainerCallbacks) {
    this._trainerCallbacks = trainerCallbacks;
  }

  includeDataSlice() {
    
  }
}

export default Trainer;